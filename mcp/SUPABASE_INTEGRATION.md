# 🔗 EdnSy MCP Server - Supabase Integration Guide

This guide explains how to integrate the EdnSy MCP server with Supabase for user authentication, OAuth2 token management, and tool access control.

## 🎯 Architecture Overview

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

## 🏗️ Supabase Database Schema

### 1. Users Table (Supabase Auth)
```sql
-- This is automatically managed by Supabase Auth
-- auth.users table contains:
-- - id (UUID)
-- - email
-- - created_at
-- - last_sign_in_at
-- etc.
```

### 2. User OAuth2 Tokens Table
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

-- Enable RLS
ALTER TABLE user_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tokens
CREATE POLICY "Users can view own tokens" ON user_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON user_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON user_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. User Tool Access Table
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

-- Enable RLS
ALTER TABLE user_tool_access ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tool permissions
CREATE POLICY "Users can view own tool access" ON user_tool_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tool access" ON user_tool_access
  FOR UPDATE USING (auth.uid() = user_id);
```

### 4. Tool Categories Table
```sql
CREATE TABLE tool_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL, -- 'gmail', 'calendar', 'notion', etc.
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  requires_oauth BOOLEAN DEFAULT false,
  oauth_provider VARCHAR(50), -- 'google', 'notion', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO tool_categories (name, display_name, description, requires_oauth, oauth_provider) VALUES
  ('gmail', 'Gmail', 'Send and manage emails', true, 'google'),
  ('calendar', 'Google Calendar', 'Manage calendar events', true, 'google'),
  ('sheets', 'Google Sheets', 'Read and write spreadsheet data', true, 'google'),
  ('drive', 'Google Drive', 'Manage files and folders', true, 'google'),
  ('notion', 'Notion', 'Manage Notion databases and pages', true, 'notion');
```

## 🔐 Authentication Flow

### 1. User OAuth2 Flow (Client-Side)
```javascript
// Client-side OAuth2 implementation
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

### 2. AI Agent Token Retrieval
```javascript
class EdnSyMCPAgent {
  constructor(supabaseClient, mcpServerUrl) {
    this.supabase = supabaseClient;
    this.mcpServerUrl = mcpServerUrl;
  }

  async getAvailableTools(userId) {
    const { data: tools, error } = await this.supabase
      .from('user_tool_access')
      .select(`
        tool_name,
        is_enabled,
        rate_limit_per_hour,
        tool_categories (
          name,
          display_name,
          requires_oauth,
          oauth_provider
        )
      `)
      .eq('user_id', userId)
      .eq('is_enabled', true);

    if (error) throw error;
    return tools;
  }

  async getOAuthTokens(userId, provider) {
    const { data: tokens, error } = await this.supabase
      .from('user_oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (error) throw error;
    
    // Check if token is expired
    if (tokens.expires_at && new Date() > new Date(tokens.expires_at)) {
      // Token expired, refresh it
      const refreshedTokens = await this.refreshTokens(userId, provider, tokens.refresh_token);
      return refreshedTokens;
    }

    return tokens;
  }

  async refreshTokens(userId, provider, refreshToken) {
    // Implement token refresh logic
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, refresh_token: refreshToken })
    });

    const newTokens = await response.json();
    
    // Update tokens in Supabase
    await this.supabase
      .from('user_oauth_tokens')
      .update({
        access_token: newTokens.access_token,
        expires_at: new Date(Date.now() + newTokens.expires_in * 1000),
        updated_at: new Date()
      })
      .eq('user_id', userId)
      .eq('provider', provider);

    return newTokens;
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

  // Helper methods for common operations
  async sendGmail(userId, to, subject, body) {
    const message = this.createGmailMessage(to, subject, body);
    const encodedMessage = btoa(message);
    
    return this.callMCPTool('send_messages', {
      userId: 'me',
      encodedMessage
    }, userId);
  }

  async createCalendarEvent(userId, summary, startTime, endTime) {
    return this.callMCPTool('create_an_event', {
      calendarId: 'primary',
      event: {
        summary,
        start: { dateTime: startTime, timeZone: 'UTC' },
        end: { dateTime: endTime, timeZone: 'UTC' }
      }
    }, userId);
  }

  async queryNotionDatabase(userId, databaseId, filter = null) {
    return this.callMCPTool('query_database', {
      databaseId,
      ...(filter && { filter })
    }, userId);
  }
}
```

## 🚀 Implementation Steps

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

### 2. Configure Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth2 (for your app)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Create API Routes
```javascript
// pages/api/auth/google/token.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      })
    });

    const tokens = await response.json();
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 4. Initialize User Tool Access
```javascript
// When user first signs up or connects OAuth
async function initializeUserTools(userId) {
  const defaultTools = [
    'send_messages',
    'list_messages',
    'create_an_event',
    'retrieve_database',
    'query_database'
  ];

  const toolAccess = defaultTools.map(toolName => ({
    user_id: userId,
    tool_name: toolName,
    is_enabled: true,
    rate_limit_per_hour: 100
  }));

  const { error } = await supabase
    .from('user_tool_access')
    .insert(toolAccess);

  if (error) throw error;
}
```

## 🔒 Security Features

### 1. Row Level Security (RLS)
- Users can only access their own tokens and tool permissions
- Automatic data isolation per user

### 2. Token Encryption
```sql
-- Encrypt sensitive token data
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update table to use encrypted columns
ALTER TABLE user_oauth_tokens 
ADD COLUMN encrypted_access_token BYTEA,
ADD COLUMN encrypted_refresh_token BYTEA;

-- Encrypt tokens before storing
UPDATE user_oauth_tokens SET
  encrypted_access_token = pgp_sym_encrypt(access_token, current_setting('app.encryption_key')),
  encrypted_refresh_token = pgp_sym_encrypt(refresh_token, current_setting('app.encryption_key'));
```

### 3. Rate Limiting
```javascript
// Implement rate limiting per user per tool
async function checkRateLimit(userId, toolName) {
  const { data: usage } = await supabase
    .from('tool_usage_log')
    .select('created_at')
    .eq('user_id', userId)
    .eq('tool_name', toolName)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000)); // Last hour

  const hourlyLimit = 100; // Get from user_tool_access table
  
  if (usage.length >= hourlyLimit) {
    throw new Error('Rate limit exceeded');
  }

  // Log usage
  await supabase
    .from('tool_usage_log')
    .insert({
      user_id: userId,
      tool_name: toolName,
      created_at: new Date()
    });
}
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
