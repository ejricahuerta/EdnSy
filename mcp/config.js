export const config = {
  server: {
    name: 'ednsy-mcp-server',
    version: '1.0.0',
    description: 'MCP Server for EdnSy project with Notion and Google APIs'
  },
  
  capabilities: {
    tools: {
      // Enable all tool capabilities
    }
  },
  
  // Default server settings
  defaults: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Tool discovery settings
  tools: {
    // Paths to tool directories
    paths: [
      'notion-s-api-workspace/notion-api',
      'google-api-workspace/google-ap-is-access-and-examples',
      'google-api-workspace/google-gmail-api',
      'google-api-workspace/google-calendar-api',
      'google-api-workspace/google-sheets-api',
      'google-api-workspace/google-drive-api'
    ]
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: true,
    enableFile: false
  }
};
