-- OAuth Tokens Migration for EdnSy Platform
-- Creates the user_oauth_tokens table for storing third-party service tokens

-- Create table for storing user OAuth tokens
CREATE TABLE user_oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL CHECK (service_name IN ('google', 'notion', 'slack', 'stripe')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  token_type TEXT DEFAULT 'Bearer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, service_name)
);

-- Enable Row Level Security
ALTER TABLE user_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tokens
CREATE POLICY "Users can view own tokens" ON user_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON user_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON user_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON user_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_oauth_tokens_updated_at 
    BEFORE UPDATE ON user_oauth_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for performance
CREATE INDEX idx_user_oauth_tokens_user_service ON user_oauth_tokens(user_id, service_name);
CREATE INDEX idx_user_oauth_tokens_expires_at ON user_oauth_tokens(expires_at);

-- Comments
COMMENT ON TABLE user_oauth_tokens IS 'Stores OAuth tokens for third-party service integrations';
COMMENT ON COLUMN user_oauth_tokens.service_name IS 'Name of the third-party service (google, notion, slack, stripe)';
COMMENT ON COLUMN user_oauth_tokens.access_token IS 'OAuth access token for API calls';
COMMENT ON COLUMN user_oauth_tokens.refresh_token IS 'OAuth refresh token for renewing access tokens';
COMMENT ON COLUMN user_oauth_tokens.expires_at IS 'When the access token expires';
COMMENT ON COLUMN user_oauth_tokens.scope IS 'OAuth scopes granted for this token';
