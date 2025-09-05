# MCP Server Integration Complete

## Overview

The MCP server has been successfully integrated with the EdnSy landing app for secure, client-driven authentication. This integration allows AI agents to use the MCP server tools while the landing app handles all OAuth token management through Supabase.

## Architecture Summary

```
AI Agent → MCP Server → Landing App → Supabase → OAuth Tokens → API Calls
```

## Key Components Updated

### 1. MCP Server (`mcpServer.js`)
- **Landing Integration**: Imports and uses `LandingIntegration` class
- **User Context Extraction**: Extracts `userId` or `mcpUserId` from tool arguments
- **Token Resolution**: Calls landing app to get user-specific OAuth tokens
- **Service Authorization**: Validates user access to requested services
- **Error Handling**: Proper MCP error responses for authentication failures

### 2. Landing Integration (`lib/landing-integration.js`)
- **API Communication**: Secure requests to landing app using `MCP_API_KEY`
- **Token Management**: Retrieves user OAuth tokens for specific services
- **Service Validation**: Checks if users have connected required services
- **Graceful Degradation**: Works in testing mode without API key

### 3. Updated Tools
The following tools have been updated to use the new authentication context:

#### Notion Tools
- `query-a-database.js` - Updated to use `authContext.notion.access_token`

#### Google API Tools
- `send-messages.js` (Gmail) - Updated to use `authContext.google.access_token`
- `create-an-event.js` (Calendar) - Updated to use `authContext.google.access_token`

### 4. Tool Parameter Updates
All updated tools now require a `userId` or `mcpUserId` parameter for authentication:

```javascript
{
  "name": "query_database",
  "parameters": {
    "databaseId": "database-123",
    "userId": "user-456"  // Required for authentication
  }
}
```

## Authentication Flow

1. **Tool Call**: AI agent calls MCP tool with `userId` parameter
2. **Context Extraction**: MCP server extracts user context from arguments
3. **Service Validation**: MCP server checks if user has access to required service
4. **Token Retrieval**: MCP server requests OAuth tokens from landing app using `MCP_API_KEY`
5. **API Call**: Tool executes with user's OAuth tokens
6. **Response**: Result returned to AI agent

## Security Features

- **Server-to-Server Auth**: `MCP_API_KEY` secures communication between MCP server and landing app
- **User Isolation**: Each request includes specific `userId` for token access
- **Service Validation**: Users can only access services they've connected
- **Token Security**: OAuth tokens never exposed to AI agents, only to MCP server
- **Supabase RLS**: Row Level Security ensures users only access their own tokens

## Environment Variables

### MCP Server (`.env`)
```bash
MCP_API_KEY=your-secret-key-here
LANDING_APP_URL=http://localhost:5173
LOG_LEVEL=info
```

### Landing App (`.env`)
```bash
MCP_API_KEY=your-secret-key-here
# ... other OAuth provider keys
```

## Testing

The integration includes testing mode:
- When `MCP_API_KEY` is not set, mock tokens are provided
- All 31 tools are discovered and available
- Health checks pass at `/health` endpoint
- Tools info available at `/tools` endpoint

## Next Steps

To complete the integration:

1. **Set Environment Variables**: Configure `MCP_API_KEY` in both apps
2. **Update Remaining Tools**: Apply authentication context pattern to remaining tools
3. **Test End-to-End**: Test full flow with real OAuth tokens from landing app
4. **Deploy**: Deploy both MCP server and landing app with proper configuration

## Tool Call Examples

### Before (Environment Variables)
```javascript
{
  "name": "query_database",
  "arguments": {
    "databaseId": "database-123"
  }
}
// Used process.env.NOTION_API_KEY
```

### After (Client-Driven Authentication)
```javascript
{
  "name": "query_database", 
  "arguments": {
    "databaseId": "database-123",
    "userId": "user-456"
  }
}
// Dynamically resolves user's Notion OAuth token from Supabase
```

This architecture provides a secure, scalable foundation for multi-user API access through the MCP server while maintaining complete user control over their authentication credentials.
