# 🔐 EdnSy MCP Server Authentication Guide

This guide explains how authentication works with the EdnSy MCP server using Supabase for user management and OAuth2 token storage.

## 🎯 Authentication Architecture

The EdnSy MCP server uses a **client-driven authentication model** where:

```
User → AI Agent → Supabase → MCP Server → External APIs
  ↓         ↓         ↓           ↓           ↓
Login   Get Tokens  Token Store  Validation  API Calls
        + Tools    + Access     + Rate      + Results
                   Control      Limiting
```

**Key Benefits:**
- ✅ **Centralized authentication** via Supabase
- ✅ **Secure token storage** with user mapping
- ✅ **Tool access control** per user/client
- ✅ **Scalable user management** with Supabase Auth
- ✅ **Real-time updates** for token refresh

## 🔑 OAuth2 Flow Overview

### 1. User Authentication (Client-Side)
Users authenticate with your application using Supabase Auth:
- Email/password login
- Social login (Google, GitHub, etc.)
- Magic link authentication

### 2. OAuth2 Service Connection
Users connect external services through your app:
- **Google APIs**: Gmail, Calendar, Sheets, Drive
- **Notion**: Workspace and database access

### 3. Token Storage
OAuth2 tokens are securely stored in Supabase:
- Encrypted at rest using pgcrypto
- User-isolated via Row Level Security
- Automatic expiration handling

### 4. AI Agent Integration
AI agents retrieve tokens from Supabase when calling MCP tools:
- Check user permissions
- Retrieve valid OAuth2 tokens
- Call MCP tools with authentication

## 🏗️ Supabase Database Schema

### Core Tables

#### 1. User OAuth2 Tokens
```sql
CREATE TABLE user_oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'notion', etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[], -- Array of granted scopes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, provider)
);
```

#### 2. User Tool Access
```sql
CREATE TABLE user_tool_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name VARCHAR(100) NOT NULL, -- e.g., 'send_messages', 'retrieve_database'
  is_enabled BOOLEAN DEFAULT true,
  rate_limit_per_hour INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, tool_name)
);
```

#### 3. Tool Categories
```sql
CREATE TABLE tool_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  requires_oauth BOOLEAN DEFAULT false,
  oauth_provider VARCHAR(50), -- 'google', 'notion', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Implementation Steps

### 1. Set Up Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local development
supabase start

# Apply migrations
supabase db push
```

### 2. Configure OAuth2 Providers

#### Google OAuth2
1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing

2. **Enable Required APIs**
   - Gmail API
   - Google Calendar API
   - Google Sheets API
   - Google Drive API

3. **Create OAuth2 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs

4. **Configure Scopes**
   ```javascript
   const googleScopes = [
     'https://www.googleapis.com/auth/gmail.send',
     'https://www.googleapis.com/auth/calendar',
     'https://www.googleapis.com/auth/spreadsheets',
     'https://www.googleapis.com/auth/drive'
   ];
   ```

#### Notion Integration
1. **Create Notion Integration**
   - Go to [Notion Developers](https://developers.notion.com/)
   - Click "New integration"
   - Fill in integration details
   - Copy the "Internal Integration Token"

2. **Share Resources**
   - Go to any Notion page or database
   - Click "Share" → "Invite" → "Add people, emails, groups, or integrations"
   - Add your integration

### 3. Implement OAuth2 Flow

#### Client-Side OAuth2 Handler
```javascript
class SupabaseOAuth2Client {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  async authenticateGoogle(scopes) {
    // 1. Generate OAuth2 URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    })}`;

    // 2. Store state for CSRF protection
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    
    // 3. Redirect to Google
    window.location.href = `${authUrl}&state=${state}`;
  }

  async handleGoogleCallback(code, state) {
    // 1. Verify state parameter
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    sessionStorage.removeItem('oauth_state');

    // 2. Exchange code for tokens
    const response = await fetch('/api/auth/google/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const tokens = await response.json();

    // 3. Store tokens in Supabase
    await this.storeTokens('google', tokens);

    return tokens;
  }

  async storeTokens(provider, tokens) {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('user_oauth_tokens')
      .upsert({
        user_id: user.id,
        provider,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? 
          new Date(Date.now() + tokens.expires_in * 1000) : null,
        scopes: tokens.scope ? tokens.scope.split(' ') : [],
        updated_at: new Date()
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) throw error;
    return data;
  }
}
```

### 4. AI Agent Integration

#### MCP Agent Class
```javascript
class EdnSyMCPAgent {
  constructor(supabaseClient, mcpServerUrl) {
    this.supabase = supabaseClient;
    this.mcpServerUrl = mcpServerUrl;
  }

  async callMCPTool(toolName, arguments, userId) {
    // 1. Check if user has access to this tool
    const availableTools = await this.getAvailableTools(userId);
    const toolAccess = availableTools.find(t => t.tool_name === toolName);
    
    if (!toolAccess) {
      throw new Error(`Tool ${toolName} not available for user`);
    }

    // 2. Get required OAuth tokens
    const toolCategory = toolAccess.tool_categories;
    let oauthTokens = null;
    
    if (toolCategory.requires_oauth) {
      oauthTokens = await this.getOAuthTokens(userId, toolCategory.oauth_provider);
    }

    // 3. Prepare MCP call with authentication
    const mcpRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: {
          ...arguments,
          // Add authentication based on tool category
          ...(toolCategory.oauth_provider === 'google' && { 
            accessToken: oauthTokens.access_token 
          }),
          ...(toolCategory.oauth_provider === 'notion' && { 
            apiKey: oauthTokens.access_token 
          })
        }
      }
    };

    // 4. Call MCP server
    const response = await fetch(`${this.mcpServerUrl}/tools/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mcpRequest)
    });

    return response.json();
  }
}
```

## 🔒 Security Features

### 1. Row Level Security (RLS)
All tables use RLS policies for automatic user isolation:
```sql
-- Users can only access their own tokens
CREATE POLICY "Users can view own tokens" ON user_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only access their own tool permissions
CREATE POLICY "Users can view own tool access" ON user_tool_access
  FOR SELECT USING (auth.uid() = user_id);
```

### 2. Token Encryption
Sensitive data is encrypted using pgcrypto:
```sql
-- Enable encryption extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Encrypt tokens before storing
UPDATE user_oauth_tokens SET
  encrypted_access_token = pgp_sym_encrypt(access_token, current_setting('app.encryption_key')),
  encrypted_refresh_token = pgp_sym_encrypt(refresh_token, current_setting('app.encryption_key'));
```

### 3. Rate Limiting
Per-user, per-tool usage limits:
```sql
-- Check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_tool_name VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_hourly_limit INTEGER;
  v_current_usage INTEGER;
BEGIN
  -- Get user's rate limit for the tool
  SELECT rate_limit_per_hour INTO v_hourly_limit
  FROM user_tool_access
  WHERE user_id = p_user_id AND tool_name = p_tool_name AND is_enabled = true;
  
  IF v_hourly_limit IS NULL THEN
    RETURN false; -- Tool not available
  END IF;
  
  -- Count usage in the last hour
  SELECT COUNT(*) INTO v_current_usage
  FROM tool_usage_log
  WHERE user_id = p_user_id 
    AND tool_name = p_tool_name
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN v_current_usage < v_hourly_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🧪 Testing the Integration

### 1. Test OAuth2 Flow
```javascript
// Test Google OAuth2
const oauthClient = new SupabaseOAuth2Client(supabase);
await oauthClient.authenticateGoogle([
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar'
]);
```

### 2. Test MCP Tool Calls
```javascript
// Test with user authentication
const agent = new EdnSyMCPAgent(supabase, 'http://localhost:3001');

// Send email
await agent.sendGmail(userId, 'test@example.com', 'Test', 'Hello World');

// Create calendar event
await agent.createCalendarEvent(userId, 'Test Meeting', '2024-01-15T10:00:00Z', '2024-01-15T11:00:00Z');
```

### 3. Test Tool Access Control
```javascript
// Disable a tool for a user
await supabase
  .from('user_tool_access')
  .update({ is_enabled: false })
  .eq('user_id', userId)
  .eq('tool_name', 'send_messages');

// Try to use disabled tool (should fail)
try {
  await agent.sendGmail(userId, 'test@example.com', 'Test', 'Hello');
} catch (error) {
  console.log('Tool access denied as expected');
}
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [MCP Server Setup](SETUP.md)
- [Client Integration Guide](CLIENT_INTEGRATION.md)

---

## 🎯 Next Steps

1. **Set up Supabase project** and apply database schema
2. **Implement OAuth2 flow** for Google and Notion
3. **Create AI agent integration** with Supabase
4. **Test authentication flow** end-to-end
5. **Deploy with proper security** measures

**Need help?** Check the Supabase documentation or review the server logs with debug mode enabled.
