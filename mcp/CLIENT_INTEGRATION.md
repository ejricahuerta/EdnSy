# 🔗 EdnSy MCP Server - Client Integration Guide

This guide explains how clients can integrate with the EdnSy MCP server using their own OAuth2 credentials and API keys.

## 🎯 Overview

The EdnSy MCP server is designed for **client-driven authentication**, meaning:

- ✅ **Clients provide their own OAuth2 credentials** for Google APIs
- ✅ **Clients create their own Notion integrations** and provide API keys
- ✅ **No credential storage** on the MCP server
- ✅ **AI agents act as intermediaries** between clients and the MCP server
- ✅ **Secure, stateless design** with rate limiting and validation

## 🔄 Integration Flow

```
Client → AI Agent → MCP Server → External APIs (Google, Notion)
   ↓           ↓         ↓              ↓
OAuth2    Credentials  Validation   API Calls
Tokens    + Tool      + Rate       + Results
          Access      Limiting
```

## 🛠️ Integration Methods

### 1. Direct MCP Client Integration

For applications that can directly use MCP clients (like Claude Desktop, Cursor):

```javascript
// Example: Direct MCP tool call
const mcpRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "send_messages",
    arguments: {
      userId: "me",
      accessToken: "user_oauth_access_token",
      encodedMessage: "base64_encoded_message"
    }
  }
};
```

### 2. AI Agent Integration (Recommended)

For applications using AI agents as intermediaries:

```javascript
class EdnSyMCPAgent {
  constructor(mcpServerUrl) {
    this.mcpServerUrl = mcpServerUrl;
  }

  async callTool(toolName, arguments, userCredentials) {
    // Add authentication to tool arguments
    const authenticatedArgs = {
      ...arguments,
      ...this.getAuthForTool(toolName, userCredentials)
    };

    // Call MCP server
    const response = await fetch(`${this.mcpServerUrl}/tools/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: authenticatedArgs
        }
      })
    });

    return response.json();
  }

  getAuthForTool(toolName, credentials) {
    // Determine authentication method based on tool
    if (toolName.startsWith('gmail_') || toolName.startsWith('calendar_')) {
      return { accessToken: credentials.google.accessToken };
    } else if (toolName.startsWith('notion_')) {
      return { apiKey: credentials.notion.apiKey };
    }
    return {};
  }
}
```

## 🔐 Authentication Setup

### Google APIs

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable required APIs (Gmail, Calendar, Sheets, Drive)

2. **Set Up OAuth2 Credentials**
   - Create OAuth 2.0 Client ID
   - Configure authorized redirect URIs
   - Set appropriate scopes

3. **Implement OAuth2 Flow**
   ```javascript
   const googleScopes = [
     'https://www.googleapis.com/auth/gmail.send',
     'https://www.googleapis.com/auth/calendar',
     'https://www.googleapis.com/auth/spreadsheets',
     'https://www.googleapis.com/auth/drive'
   ];

   // Generate authorization URL
   const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
     client_id: 'your_client_id',
     redirect_uri: 'your_redirect_uri',
     scope: googleScopes.join(' '),
     response_type: 'code',
     access_type: 'offline'
   })}`;
   ```

### Notion API

1. **Create Integration**
   - Go to [Notion Developers](https://developers.notion.com/)
   - Create new integration
   - Copy the Internal Integration Token

2. **Share Resources**
   - Share pages/databases with your integration
   - Grant appropriate permissions

## 📱 Usage Examples

### Send Email via Gmail

```javascript
const agent = new EdnSyMCPAgent('http://localhost:3001');

const userCredentials = {
  google: {
    accessToken: 'ya29.access_token_here'
  }
};

// Send email
const result = await agent.callTool('send_messages', {
  userId: 'me',
  encodedMessage: btoa(`
From: me
To: recipient@example.com
Subject: Test Email
Content-Type: text/plain; charset=UTF-8

This is a test email sent via the EdnSy MCP server!
  `)
}, userCredentials);
```

### Create Calendar Event

```javascript
const result = await agent.callTool('create_an_event', {
  calendarId: 'primary',
  event: {
    summary: 'Team Meeting',
    start: { dateTime: '2024-01-15T10:00:00Z', timeZone: 'UTC' },
    end: { dateTime: '2024-01-15T11:00:00Z', timeZone: 'UTC' }
  }
}, userCredentials);
```

### Query Notion Database

```javascript
const result = await agent.callTool('query_database', {
  databaseId: 'your_database_id',
  filter: {
    property: 'Status',
    select: { equals: 'Active' }
  }
}, userCredentials);
```

## 🔒 Security Best Practices

### 1. Credential Management
- **Never store credentials** in client-side code
- **Use secure storage** for OAuth2 tokens
- **Implement token refresh** mechanisms
- **Rotate credentials** regularly

### 2. API Security
- **Request minimum scopes** needed for functionality
- **Validate all inputs** before sending to MCP server
- **Use HTTPS** for all communications
- **Implement rate limiting** on client side

### 3. Error Handling
```javascript
try {
  const result = await agent.callTool('send_messages', args, credentials);
  console.log('Success:', result);
} catch (error) {
  if (error.message.includes('access_denied')) {
    // Handle authentication error
    await refreshTokens();
  } else if (error.message.includes('rate_limit')) {
    // Handle rate limiting
    await delay(1000);
  } else {
    // Handle other errors
    console.error('Tool call failed:', error);
  }
}
```

## 🧪 Testing Integration

### 1. Test Authentication
```javascript
// Test with valid credentials
const testResult = await agent.callTool('list_messages', {
  userId: 'me',
  maxResults: 5
}, testCredentials);

console.log('Authentication successful:', testResult);
```

### 2. Test Error Handling
```javascript
// Test with invalid credentials
try {
  await agent.callTool('send_messages', args, invalidCredentials);
} catch (error) {
  console.log('Expected error caught:', error.message);
}
```

### 3. Test Rate Limiting
```javascript
// Test multiple rapid calls
for (let i = 0; i < 10; i++) {
  try {
    await agent.callTool('list_messages', args, credentials);
    console.log(`Call ${i + 1} successful`);
  } catch (error) {
    if (error.message.includes('rate_limit')) {
      console.log('Rate limit hit, waiting...');
      await delay(1000);
    }
  }
}
```

## 📊 Monitoring and Analytics

### 1. Track Usage
```javascript
class UsageTracker {
  constructor() {
    this.usage = new Map();
  }

  trackToolUsage(toolName, success, duration) {
    if (!this.usage.has(toolName)) {
      this.usage.set(toolName, { calls: 0, errors: 0, totalDuration: 0 });
    }
    
    const stats = this.usage.get(toolName);
    stats.calls++;
    if (!success) stats.errors++;
    stats.totalDuration += duration;
  }

  getStats() {
    return Object.fromEntries(this.usage);
  }
}
```

### 2. Error Monitoring
```javascript
class ErrorMonitor {
  logError(toolName, error, context) {
    console.error(`Tool ${toolName} failed:`, {
      error: error.message,
      context,
      timestamp: new Date().toISOString()
    });
  }
}
```

## 🚀 Production Deployment

### 1. Environment Configuration
```bash
# Production environment variables
MCP_SERVER_URL=https://your-mcp-server.com
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
NOTION_CLIENT_ID=your_production_notion_client_id
```

### 2. Monitoring Setup
- **Log aggregation** for error tracking
- **Performance monitoring** for response times
- **Rate limit alerts** for usage spikes
- **Authentication failure tracking**

### 3. Scaling Considerations
- **Connection pooling** for high-traffic applications
- **Caching strategies** for frequently accessed data
- **Load balancing** across multiple MCP server instances
- **Circuit breaker patterns** for fault tolerance

## 📚 Additional Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Google APIs Documentation](https://developers.google.com/)
- [Notion API Documentation](https://developers.notion.com/)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/rfc6819)

---

## 🎯 Next Steps

1. **Set up OAuth2 credentials** for Google and Notion
2. **Implement authentication flow** in your application
3. **Test integration** with the MCP server
4. **Deploy to production** with proper security measures
5. **Monitor usage** and optimize performance

**Need help?** Check the authentication guide or review the server logs for debugging information.
