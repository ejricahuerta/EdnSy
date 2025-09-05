-- OAuth Tokens Database Setup Script for EdnSy Platform
-- This script creates the necessary tables and security policies for OAuth integration

-- Create the user_oauth_tokens table
CREATE TABLE IF NOT EXISTS user_oauth_tokens (
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

-- Create RLS policies for user isolation
CREATE POLICY IF NOT EXISTS "Users can view own tokens" ON user_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own tokens" ON user_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own tokens" ON user_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own tokens" ON user_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_user_oauth_tokens_updated_at ON user_oauth_tokens;
CREATE TRIGGER update_user_oauth_tokens_updated_at 
    BEFORE UPDATE ON user_oauth_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_oauth_tokens_user_service ON user_oauth_tokens(user_id, service_name);
CREATE INDEX IF NOT EXISTS idx_user_oauth_tokens_expires_at ON user_oauth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_oauth_tokens_service_name ON user_oauth_tokens(service_name);

-- Create a view for token health monitoring (admin use only)
CREATE OR REPLACE VIEW token_health_summary AS
SELECT 
  service_name,
  COUNT(*) as total_tokens,
  COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_tokens,
  COUNT(CASE WHEN expires_at <= NOW() + INTERVAL '1 hour' THEN 1 END) as expiring_soon,
  COUNT(CASE WHEN refresh_token IS NULL THEN 1 END) as no_refresh_token,
  AVG(EXTRACT(EPOCH FROM (expires_at - created_at))) as avg_token_lifetime_seconds
FROM user_oauth_tokens
GROUP BY service_name;

-- Create function to clean up expired tokens (optional maintenance)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_oauth_tokens 
  WHERE expires_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_oauth_tokens TO authenticated;
GRANT SELECT ON token_health_summary TO authenticated;

-- Insert sample data for testing (remove in production)
-- INSERT INTO user_oauth_tokens (user_id, service_name, access_token, refresh_token, expires_at, scope)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000000', 'google', 'sample_access_token', 'sample_refresh_token', NOW() + INTERVAL '1 hour', 'https://www.googleapis.com/auth/calendar');

-- Verify the setup
SELECT 
  'Table created successfully' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name = 'user_oauth_tokens';

SELECT 
  'Policies created successfully' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'user_oauth_tokens';

SELECT 
  'Indexes created successfully' as status,
  COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename = 'user_oauth_tokens';

-- Display the final table structure
\d user_oauth_tokens;
