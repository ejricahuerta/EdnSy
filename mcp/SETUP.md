# 🚀 EdnSy MCP Server Setup Guide

This guide will help you set up and configure the EdnSy MCP (Model Context Protocol) server for integration with Notion and Google APIs.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to Google Cloud Console (for OAuth2 setup)
- Access to Notion Developers (for API integration)
- Supabase project (for user authentication and token storage)

## 🔧 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your server configuration:
```bash
# Server Configuration
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# Note: No API keys needed - clients provide their own OAuth2 credentials
```

### 3. Test the Server
```bash
# Test STDIO mode
npm test

# List available tools
npm run list-tools
```

## 🚀 Starting the Server

### STDIO Mode (Recommended for MCP Clients)
```bash
npm start
```
**Use this mode for:**
- Claude Desktop
- Cursor IDE
- Other MCP-compatible clients

### SSE Mode (HTTP Endpoints)
```bash
npm run start:sse
```
**Use this mode for:**
- Web applications
- Custom HTTP clients
- Testing HTTP endpoints

## 🧪 Testing

### Test STDIO Mode
```bash
npm test
```
This runs a comprehensive test of the MCP server functionality.

### Test HTTP Endpoints (SSE Mode)
```bash
# Start the server in SSE mode
npm run start:sse

# In another terminal, test the endpoints
npm run health
npm run tools
```

### Manual Testing
```bash
# Health check
curl http://localhost:3001/health

# List tools
curl http://localhost:3001/tools
```

## 🔧 Configuration

### Server Settings
The server configuration is managed in `config.js`:

```javascript
export const config = {
  server: {
    name: 'ednsy-mcp-server',
    version: '1.0.0',
    description: 'MCP Server for EdnSy project'
  },
  defaults: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  }
};
```

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port number |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Logging level |

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start server in STDIO mode |
| `npm run start:sse` | Start server with HTTP/SSE endpoints |
| `npm test` | Test STDIO mode functionality |
| `npm run list-tools` | List all available tools |
| `npm run health` | Check server health (SSE mode) |

## 🔍 Troubleshooting

### Common Issues

**Server won't start:**
- Check if port 3001 is available
- Verify Node.js version (18+ required)
- Check environment file configuration

**Tools not discovered:**
- Verify tool files exist in `tools/` directory
- Check file permissions
- Review server logs for errors

**HTTP endpoints not working:**
- Ensure server is running in SSE mode
- Check firewall settings
- Verify port configuration

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in your `.env` file.

### Logs
Server logs are output to stdout/stderr. For production, consider redirecting to log files.

## 📚 Next Steps

After setting up the server:

1. **Set up Supabase** - Follow the [Supabase Integration Guide](SUPABASE_INTEGRATION.md)
2. **Configure OAuth2** - Set up Google and Notion OAuth2 flows
3. **Test Integration** - Verify end-to-end functionality
4. **Deploy** - Move to production environment

## 📞 Support

For additional help:
- Check the [README](README.md) for overview
- Review [Supabase Integration](SUPABASE_INTEGRATION.md) for database setup
- Check [Client Integration](CLIENT_INTEGRATION.md) for usage examples

---

**Need help?** Check the server logs and verify your configuration matches the examples above.

