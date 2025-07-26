-- Ednsy Demo Platform Database Schema
-- Run this in your Supabase SQL editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  demo_credits INTEGER DEFAULT 200,
  industry_preference TEXT,
  total_demos_completed INTEGER DEFAULT 0,
  consultation_booked BOOLEAN DEFAULT FALSE
);

-- Create demos table
CREATE TABLE IF NOT EXISTS demos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT NOT NULL,
  credit_cost INTEGER NOT NULL,
  estimated_time INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  benefits TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create demo_sessions table
CREATE TABLE IF NOT EXISTS demo_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  demo_id TEXT REFERENCES demos(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  credits_used INTEGER NOT NULL,
  progress_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  demo_id TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  calendly_link TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_demos_industry ON demos(industry);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_user_id ON demo_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_demo_id ON demo_sessions(demo_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE demos ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Demos are public (read-only)
CREATE POLICY "Anyone can view demos" ON demos
  FOR SELECT USING (true);

-- Demo sessions
CREATE POLICY "Users can view own demo sessions" ON demo_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own demo sessions" ON demo_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own demo sessions" ON demo_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Consultations
CREATE POLICY "Users can view own consultations" ON consultations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultations" ON consultations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultations" ON consultations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, demo_credits, industry_preference)
  VALUES (NEW.id, NEW.email, 200, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample demo data
INSERT INTO demos (id, title, description, industry, credit_cost, estimated_time, difficulty, benefits) VALUES
-- AI Assistant Demo
('ai-assistant', 'AI Assistant', 'Intelligent customer support chatbot for scheduling and inquiries 24/7', 'general', 30, 15, 'beginner', ARRAY['Handle scheduling requests', '24/7 availability', 'Instant responses', 'Reduce support workload by 60%']),

-- Automation Tasks Demo
('automation-tasks', 'Lead to Sale Automation', 'Automated lead processing from inquiry to booking for service calls', 'general', 35, 18, 'intermediate', ARRAY['Auto-schedule jobs', 'Instant quotes', 'Customer follow-ups', 'Convert 40% more leads']),

-- Data Insights Demo
('data-insights', 'Service Analytics', 'AI-powered insights for technician performance and business metrics', 'general', 40, 20, 'advanced', ARRAY['Technician efficiency', 'Service profitability', 'Customer insights', 'Data-driven decisions']),

-- Business Operations Demo
('business-operations', 'Field Service Management', 'Complete field service operations from dispatch to invoicing', 'general', 45, 25, 'advanced', ARRAY['Dispatch optimization', 'Real-time tracking', 'Automated invoicing', 'End-to-end automation'])
ON CONFLICT (id) DO NOTHING; 