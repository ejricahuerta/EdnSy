#!/usr/bin/env node

import dotenv from "dotenv";
import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { discoverTools } from "./lib/tools.js";
import { landingIntegration } from "./lib/landing-integration.js";
import { config } from "./config.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const SERVER_NAME = config.server.name;
const SERVER_VERSION = config.server.version;
const SERVER_DESCRIPTION = config.server.description;

// Logging function
function log(level, message, ...args) {
  const logLevel = config.logging.level || 'info';
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  
  if (levels[level] <= levels[logLevel]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
  }
}

// Initialize tools
let tools = [];
try {
  tools = await discoverTools();
  log('info', `Discovered ${tools.length} tools`);
} catch (error) {
  log('error', 'Failed to discover tools:', error.message);
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to extract user context from tool arguments
function extractUserContext(args) {
  // Look for userId in the arguments
  if (args && typeof args === 'object') {
    // Check if userId is directly in args
    if (args.userId) {
      return { userId: args.userId };
    }
    
    // Check if mcpUserId is in args (used by some tools)
    if (args.mcpUserId) {
      return { userId: args.mcpUserId };
    }
    
    // Check if userId is nested in a context object
    if (args.context && args.context.userId) {
      return { userId: args.context.userId };
    }
    
    // Check if userId is in metadata
    if (args.metadata && args.metadata.userId) {
      return { userId: args.metadata.userId };
    }
  }
  
  return null;
}

// Helper function to determine service name from tool
function getServiceFromTool(toolName) {
  if (toolName.startsWith('notion_') || toolName.includes('notion')) {
    return 'notion';
  } else if (toolName.startsWith('gmail_') || toolName.includes('gmail')) {
    return 'google';
  } else if (toolName.startsWith('calendar_') || toolName.includes('calendar')) {
    return 'google';
  } else if (toolName.startsWith('sheets_') || toolName.includes('sheets')) {
    return 'google';
  } else if (toolName.startsWith('drive_') || toolName.includes('drive')) {
    return 'google';
  }
  
  // Default to google for Google API tools
  return 'google';
  
}

// Register tools
tools.forEach((tool) => {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map((t) => ({
        name: t.definition.function.name,
        description: t.definition.function.description,
        inputSchema: t.definition.function.parameters,
      })),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find((t) => t.definition.function.name === request.params.name);
    if (!tool) {
        throw new McpError(
        ErrorCode.MethodNotFound,
        `Tool '${request.params.name}' not found`
      );
    }

    try {
      log('info', `Calling tool: ${request.params.name}`);
      
      // Extract user context from arguments
      const userContext = extractUserContext(request.params.arguments);
      const serviceName = getServiceFromTool(request.params.name);
      
      // If we have user context, try to get authentication tokens
      let authContext = {};
      if (userContext && userContext.userId) {
        try {
          log('debug', `Getting auth context for user ${userContext.userId} and service ${serviceName}`);
          
          // Check if user has access to this service
          const hasService = await landingIntegration.hasService(userContext.userId, serviceName);
          if (!hasService) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `User ${userContext.userId} does not have access to ${serviceName} service`
            );
          }
          
          // Get the authentication context for this user and service
          authContext = await landingIntegration.getUserAuthContext(userContext.userId);
          log('debug', `Retrieved auth context for user ${userContext.userId}`);
        } catch (authError) {
          log('warn', `Failed to get auth context for user ${userContext.userId}:`, authError.message);
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Authentication failed: ${authError.message}`
          );
        }
      }
      
      // Prepare arguments with authentication context
      const toolArgs = {
        ...request.params.arguments,
        authContext,
        userContext
      };
      
      const result = await tool.function(toolArgs);
      log('info', `Tool ${request.params.name} completed successfully`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (error) {
      log('error', `Tool ${request.params.name} failed:`, error.message);
      
      // If it's already an MCP error, re-throw it
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Tool execution failed: ${error.message}`
      );
    }
  });
});

// Check command line arguments
  const args = process.argv.slice(2);
const isSSE = args.includes('--sse');

  if (isSSE) {
  // SSE Mode - HTTP server with Server-Sent Events
  log('info', 'Starting MCP server in SSE mode...');
  
    const app = express();
  const port = config.defaults.port;

  // Middleware
  app.use(express.json());
  app.use(express.static('public'));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      server: SERVER_NAME,
      version: SERVER_VERSION,
      tools: tools.length,
      timestamp: new Date().toISOString()
    });
  });

  // Tools info endpoint
  app.get('/tools', (req, res) => {
    res.json({
      server: SERVER_NAME,
      version: SERVER_VERSION,
      tools: tools.map(t => ({
        name: t.definition.function.name,
        description: t.definition.function.description
      })),
      total: tools.length
    });
  });

  // MCP tools endpoint
  app.post('/tools/call', async (req, res) => {
    try {
      const { name, arguments: args, userId } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Tool name is required' });
      }

      const tool = tools.find(t => t.definition.function.name === name);
      if (!tool) {
        return res.status(404).json({ error: `Tool '${name}' not found` });
      }

      log('info', `HTTP call to tool: ${name}`);
      
      // Extract user context from arguments or body
      const userContext = userId ? { userId } : extractUserContext(args);
      const serviceName = getServiceFromTool(name);
      
      // If we have user context, try to get authentication tokens
      let authContext = {};
      if (userContext && userContext.userId) {
        try {
          log('debug', `Getting auth context for user ${userContext.userId} and service ${serviceName}`);
          
          // Check if user has access to this service
          const hasService = await landingIntegration.hasService(userContext.userId, serviceName);
          if (!hasService) {
            return res.status(403).json({
              success: false,
              error: `User ${userContext.userId} does not have access to ${serviceName} service`
            });
          }
          
          // Get the authentication context for this user and service
          authContext = await landingIntegration.getUserAuthContext(userContext.userId);
          log('debug', `Retrieved auth context for user ${userContext.userId}`);
        } catch (authError) {
          log('warn', `Failed to get auth context for user ${userContext.userId}:`, authError.message);
          return res.status(401).json({
            success: false,
            error: `Authentication failed: ${authError.message}`
          });
        }
      }
      
      // Prepare arguments with authentication context
      const toolArgs = {
        ...(args || {}),
        authContext,
        userContext
      };
      
      const result = await tool.function(toolArgs);
      
      res.json({
        success: true,
        result: result
      });
    } catch (error) {
      log('error', `HTTP tool call failed:`, error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Start HTTP server
  app.listen(port, config.defaults.host, () => {
    log('info', `MCP Server running in SSE mode on http://${config.defaults.host}:${port}`);
    log('info', `Health check: http://${config.defaults.host}:${port}/health`);
    log('info', `Tools info: http://${config.defaults.host}:${port}/tools`);
  });

} else {
  // STDIO Mode - Standard MCP server
  log('info', 'Starting MCP server in STDIO mode...');

    const transport = new StdioServerTransport();
  
  // Connect the server to the transport
    await server.connect(transport);
  
  log('info', 'MCP Server running in STDIO mode');
  log('info', 'Ready to accept MCP client connections');
}
