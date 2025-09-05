-- Migration: Create MCP Server Integration Tables
-- Description: Creates tables for user OAuth2 tokens, tool access control, and usage logging

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tool Categories Table
CREATE TABLE tool_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  requires_oauth BOOLEAN DEFAULT false,
  oauth_provider VARCHAR(50), -- 'google', 'notion', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User OAuth2 Tokens Table
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

-- 3. User Tool Access Table
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

-- 4. Tool Usage Log Table
CREATE TABLE tool_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- Additional usage metadata
);

-- 5. User Tool Categories Junction Table
CREATE TABLE user_tool_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES tool_categories(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, category_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_oauth_tokens_user_id ON user_oauth_tokens(user_id);
CREATE INDEX idx_user_oauth_tokens_provider ON user_oauth_tokens(provider);
CREATE INDEX idx_user_tool_access_user_id ON user_tool_access(user_id);
CREATE INDEX idx_user_tool_access_tool_name ON user_tool_access(tool_name);
CREATE INDEX idx_tool_usage_log_user_id ON tool_usage_log(user_id);
CREATE INDEX idx_tool_usage_log_tool_name ON tool_usage_log(tool_name);
CREATE INDEX idx_tool_usage_log_created_at ON tool_usage_log(created_at);
CREATE INDEX idx_user_tool_categories_user_id ON user_tool_categories(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tool_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tool_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tool_categories (public read, admin write)
CREATE POLICY "Anyone can view active tool categories" ON tool_categories
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_oauth_tokens
CREATE POLICY "Users can view own tokens" ON user_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON user_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON user_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON user_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_tool_access
CREATE POLICY "Users can view own tool access" ON user_tool_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tool access" ON user_tool_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tool access" ON user_tool_access
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tool access" ON user_tool_access
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tool_usage_log
CREATE POLICY "Users can view own usage logs" ON tool_usage_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON tool_usage_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_tool_categories
CREATE POLICY "Users can view own tool categories" ON user_tool_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tool categories" ON user_tool_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tool categories" ON user_tool_categories
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert default tool categories
INSERT INTO tool_categories (name, display_name, description, requires_oauth, oauth_provider) VALUES
  ('gmail', 'Gmail', 'Send and manage emails via Gmail API', true, 'google'),
  ('calendar', 'Google Calendar', 'Manage calendar events via Google Calendar API', true, 'google'),
  ('sheets', 'Google Sheets', 'Read and write spreadsheet data via Google Sheets API', true, 'google'),
  ('drive', 'Google Drive', 'Manage files and folders via Google Drive API', true, 'google'),
  ('notion', 'Notion', 'Manage Notion databases and pages via Notion API', true, 'notion');

-- Create function to automatically initialize user tool access
CREATE OR REPLACE FUNCTION initialize_user_tools()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default tool access for new users
  INSERT INTO user_tool_access (user_id, tool_name, is_enabled, rate_limit_per_hour)
  SELECT 
    NEW.id,
    tc.name,
    true,
    100
  FROM tool_categories tc
  WHERE tc.is_active = true;
  
  -- Insert default tool categories for new users
  INSERT INTO user_tool_categories (user_id, category_id, is_enabled)
  SELECT 
    NEW.id,
    tc.id,
    true
  FROM tool_categories tc
  WHERE tc.is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically initialize tools for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_tools();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_tool_categories_updated_at
  BEFORE UPDATE ON tool_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_oauth_tokens_updated_at
  BEFORE UPDATE ON user_oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tool_access_updated_at
  BEFORE UPDATE ON user_tool_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to check rate limits
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

-- Create function to log tool usage
CREATE OR REPLACE FUNCTION log_tool_usage(
  p_user_id UUID,
  p_tool_name VARCHAR(100),
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO tool_usage_log (user_id, tool_name, metadata)
  VALUES (p_user_id, p_tool_name, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create a view for easy access to user's available tools
CREATE VIEW user_available_tools AS
SELECT 
  u.id as user_id,
  u.email,
  uta.tool_name,
  uta.is_enabled,
  uta.rate_limit_per_hour,
  tc.name as category_name,
  tc.display_name as category_display_name,
  tc.requires_oauth,
  tc.oauth_provider,
  uot.access_token,
  uot.expires_at
FROM auth.users u
JOIN user_tool_access uta ON u.id = uta.user_id
JOIN tool_categories tc ON uta.tool_name = tc.name
LEFT JOIN user_oauth_tokens uot ON u.id = uot.user_id AND tc.oauth_provider = uot.provider
WHERE uta.is_enabled = true AND tc.is_active = true;

-- Grant access to the view
GRANT SELECT ON user_available_tools TO authenticated;

-- Create a view for tool usage statistics
CREATE VIEW tool_usage_stats AS
SELECT 
  u.email,
  tul.tool_name,
  COUNT(*) as usage_count,
  MIN(tul.created_at) as first_used,
  MAX(tul.created_at) as last_used
FROM tool_usage_log tul
JOIN auth.users u ON tul.user_id = u.id
GROUP BY u.email, tul.tool_name
ORDER BY usage_count DESC;

-- Grant access to the view
GRANT SELECT ON tool_usage_stats TO authenticated;
