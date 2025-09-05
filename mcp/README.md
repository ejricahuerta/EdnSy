# 🔗 EdnSy MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with Notion and Google APIs, designed for AI agents to interact with external services using user-provided OAuth2 credentials stored in Supabase.

## 🎯 Architecture Overview

```
User → AI Agent → Supabase → MCP Server → External APIs
  ↓         ↓         ↓           ↓           ↓
Login   Get Tokens  Token Store  Validation  API Calls
        + Tools    + Access     + Rate      + Results
                   Control      Limiting
```

**Key Features:**
- ✅ **31+ API Tools** - Notion and Google APIs (Gmail, Calendar, Sheets, Drive)
- ✅ **Supabase Integration** - Centralized user authentication and token management
- ✅ **Client-Driven Security** - Users provide their own OAuth2 credentials
- ✅ **Tool Access Control** - Per-user tool permissions and rate limiting
- ✅ **Dual Mode Support** - STDIO for MCP clients, HTTP/SSE for web integration

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your server settings
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

### 3. Test the Server
```bash
# Test STDIO mode
npm test

# List available tools
npm run list-tools
```

### 4. Start the Server
```bash
# STDIO mode (for MCP clients like Claude Desktop, Cursor)
npm start

# SSE mode (HTTP endpoints for web integration)
npm run start:sse
```

## 🔧 Available Tools

### Google APIs
- **Gmail**: Send emails, list messages, manage threads
- **Calendar**: Create events, manage calendars, handle scheduling
- **Sheets**: Read/write spreadsheet data, manage sheets
- **Drive**: File management, folder operations, sharing

### Notion APIs
- **Databases**: Query, filter, and manage database entries
- **Pages**: Create, update, and organize page content
- **Blocks**: Manage content blocks and page structure

## 🔐 Authentication

The MCP server uses **client-driven authentication** where:

1. **Users authenticate** with Google/Notion via OAuth2
2. **Tokens are stored** securely in Supabase with user mapping
3. **AI agents retrieve** tokens from Supabase when calling tools
4. **MCP server validates** tokens and makes API calls

**No credentials stored on the MCP server** - all authentication is handled client-side.

## 📚 Documentation

- [**Setup Guide**](SETUP.md) - Complete server setup and configuration
- [**Supabase Integration**](SUPABASE_INTEGRATION.md) - Database schema and authentication flow
- [**Client Integration**](CLIENT_INTEGRATION.md) - How to integrate with the MCP server

## 🏗️ Project Structure

```
mcp/
├── lib/                    # Core MCP server logic
├── tools/                  # API tool implementations
├── supabase/              # Database migrations and schema
├── mcpServer.js           # Main server entry point
├── config.js              # Server configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🔧 Development

### Available Scripts
- `npm start` - Start server in STDIO mode
- `npm run start:sse` - Start server with HTTP/SSE endpoints
- `npm test` - Test STDIO mode functionality
- `npm run list-tools` - List all available tools
- `npm run health` - Check server health (SSE mode)

### Testing
```bash
# Test STDIO mode
npm test

# Test HTTP endpoints (requires SSE mode)
npm run start:sse
# In another terminal:
npm run health
```

## 🌐 API Endpoints (SSE Mode)

When running in SSE mode, the server provides HTTP endpoints:

- `GET /health` - Server health status
- `GET /tools` - List available tools
- `POST /tools/call` - Execute MCP tool calls
- `GET /sse` - Server-Sent Events endpoint

## 🔒 Security Features

- **Row Level Security** - Users can only access their own data
- **Token Encryption** - OAuth2 tokens encrypted in database
- **Rate Limiting** - Per-user, per-tool usage limits
- **Access Control** - Granular tool permissions per user
- **No Credential Storage** - Server never stores sensitive data

## 📞 Support

For issues or questions:
1. Check the documentation in the `docs/` directory
2. Review server logs with debug mode enabled
3. Verify Supabase configuration and database schema

---

**Built with ❤️ for the EdnSy project**
