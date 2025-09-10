-- Ednsy Demo Platform Database Schema
-- Run this in your Supabase SQL editor

-- Create demo schema
CREATE SCHEMA IF NOT EXISTS demo;

-- Create users table
CREATE TABLE IF NOT EXISTS demo.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  demo_credits INTEGER DEFAULT 200,
  industry_preference TEXT,
  total_demos_completed INTEGER DEFAULT 0,
  consultation_booked BOOLEAN DEFAULT FALSE
);

-- Create services table (renamed from demos)
CREATE TABLE IF NOT EXISTS demo.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT NOT NULL,
  training_cost INTEGER NOT NULL,
  response_cost INTEGER NOT NULL,
  action_cost INTEGER DEFAULT 0,
  estimated_time INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  benefits TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS demo.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES demo.users(id) ON DELETE CASCADE NOT NULL,
  service_id TEXT REFERENCES demo.services(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  credits_used INTEGER NOT NULL,
  progress_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_usage table to track per-action credit costs
CREATE TABLE IF NOT EXISTS demo.credit_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES demo.sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES demo.users(id) ON DELETE CASCADE NOT NULL,
  service_id TEXT REFERENCES demo.services(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('training', 'response', 'sms', 'email')),
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS demo.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES demo.users(id) ON DELETE CASCADE NOT NULL,
  service_id TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  calendly_link TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON demo.users(email);
CREATE INDEX IF NOT EXISTS idx_services_industry ON demo.services(industry);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON demo.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_service_id ON demo.sessions(service_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_session_id ON demo.credit_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_user_id ON demo.credit_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON demo.consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON demo.consultations(status);

-- Enable Row Level Security
ALTER TABLE demo.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.credit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.consultations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON demo.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON demo.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON demo.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Services are public (read-only)
CREATE POLICY "Anyone can view services" ON demo.services
  FOR SELECT USING (true);

-- Sessions
CREATE POLICY "Users can view own sessions" ON demo.sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON demo.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON demo.sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Credit usage
CREATE POLICY "Users can view own credit usage" ON demo.credit_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit usage" ON demo.credit_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Consultations
CREATE POLICY "Users can view own consultations" ON demo.consultations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultations" ON demo.consultations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultations" ON demo.consultations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION demo.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO demo.users (id, email, demo_credits, industry_preference)
  VALUES (NEW.id, NEW.email, 200, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION demo.handle_new_user();

-- Expose demo schema to Supabase API (following Supabase docs)
GRANT USAGE ON SCHEMA demo TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA demo TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA demo TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA demo TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA demo GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA demo GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA demo GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Insert sample service data with new credit structure
INSERT INTO demo.services (id, title, description, industry, training_cost, response_cost, action_cost, estimated_time, difficulty, benefits) VALUES
-- AI Assistant Demo
('ai-assistant', 'AI Assistant', 'Intelligent customer support chatbot for scheduling and inquiries 24/7', 'general', 5, 1, 0, 15, 'beginner', ARRAY['Handle scheduling requests', '24/7 availability', 'Instant responses', 'Reduce support workload by 60%']),

-- Automation Tasks Demo
('automation-tasks', 'Lead to Sale Automation', 'Automated lead processing from inquiry to booking for service calls', 'general', 7, 1, 2, 18, 'intermediate', ARRAY['Auto-schedule jobs', 'Instant quotes', 'Customer follow-ups', 'Convert 40% more leads']),

-- Data Insights Demo
('data-insights', 'Service Analytics', 'AI-powered insights for technician performance and business metrics', 'general', 10, 1, 0, 20, 'advanced', ARRAY['Technician efficiency', 'Service profitability', 'Customer insights', 'Data-driven decisions']),

-- Business Operations Demo
('business-operations', 'Field Service Management', 'Complete field service operations from dispatch to invoicing', 'general', 15, 1, 0, 25, 'advanced', ARRAY['Dispatch optimization', 'Real-time tracking', 'Automated invoicing', 'End-to-end automation'])
ON CONFLICT (id) DO NOTHING; 