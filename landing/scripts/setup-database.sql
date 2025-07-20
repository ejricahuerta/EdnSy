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
-- Restaurant demos
('restaurant-ordering', 'Online Ordering System', 'Streamline customer orders with automated kitchen integration and real-time updates', 'restaurant', 35, 15, 'intermediate', ARRAY['Reduce order errors by 80%', 'Speed up kitchen workflow by 40%', 'Improve customer satisfaction scores', 'Increase order volume by 25%']),
('restaurant-reservations', 'Reservation Management', 'Automate table bookings, waitlist management, and customer communication', 'restaurant', 30, 12, 'beginner', ARRAY['Fill empty tables efficiently', 'Reduce no-shows by 60%', 'Improve customer experience']),
('restaurant-reviews', 'Review & Social Media Automation', 'Automatically request reviews and manage social media posting', 'restaurant', 25, 10, 'beginner', ARRAY['Increase positive reviews', 'Save 5 hours/week on social media', 'Build online reputation']),
('restaurant-inventory', 'Inventory Tracking & Reordering', 'Monitor stock levels and automate supplier reordering', 'restaurant', 40, 18, 'advanced', ARRAY['Prevent stockouts', 'Reduce waste by 30%', 'Optimize purchasing costs']),
('restaurant-scheduling', 'Staff Scheduling Automation', 'Optimize staff schedules based on demand forecasting and availability', 'restaurant', 35, 15, 'intermediate', ARRAY['Reduce labor costs by 15%', 'Improve staff satisfaction', 'Handle scheduling conflicts']),

-- Professional services demos
('services-appointments', 'Appointment Scheduling', 'Automate client booking with intelligent scheduling and reminder systems', 'professional-services', 25, 12, 'beginner', ARRAY['Reduce no-shows by 70%', 'Save 3 hours/week on scheduling', 'Improve client experience']),
('services-intake', 'Client Intake Automation', 'Streamline client onboarding with automated forms and CRM integration', 'professional-services', 30, 15, 'intermediate', ARRAY['Reduce data entry by 90%', 'Improve client satisfaction', 'Speed up onboarding process']),
('services-followup', 'Follow-up Sequences', 'Automate client communication based on service type and timeline', 'professional-services', 20, 10, 'beginner', ARRAY['Increase client retention', 'Save 4 hours/week', 'Improve client outcomes']),
('services-documents', 'Document Generation', 'Automate contract creation, proposals, and e-signature workflows', 'professional-services', 35, 18, 'advanced', ARRAY['Reduce document errors', 'Speed up proposal process', 'Improve client conversion']),
('services-payments', 'Payment Processing', 'Automate invoicing, payment collection, and financial reporting', 'professional-services', 30, 15, 'intermediate', ARRAY['Get paid faster', 'Reduce payment errors', 'Improve cash flow']),

-- Retail demos
('retail-segmentation', 'Customer Segmentation', 'Automate customer data analysis and personalized marketing campaigns', 'retail', 40, 20, 'advanced', ARRAY['Increase sales by 25%', 'Improve customer retention', 'Optimize marketing spend']),
('retail-inventory', 'Inventory Management', 'Track stock levels and automate low-stock alerts and reordering', 'retail', 35, 18, 'intermediate', ARRAY['Prevent stockouts', 'Reduce carrying costs', 'Improve cash flow']),
('retail-cart-recovery', 'Abandoned Cart Recovery', 'Automate recovery sequences for abandoned shopping carts', 'retail', 30, 15, 'intermediate', ARRAY['Recover 15% of abandoned sales', 'Increase conversion rates', 'Improve customer experience']),
('retail-loyalty', 'Loyalty Program Management', 'Automate points tracking, rewards, and customer engagement', 'retail', 25, 12, 'beginner', ARRAY['Increase customer lifetime value', 'Improve retention rates', 'Drive repeat purchases']),
('retail-social', 'Social Media Automation', 'Automate content scheduling and social media engagement', 'retail', 20, 10, 'beginner', ARRAY['Save 6 hours/week', 'Increase social engagement', 'Build brand awareness']),

-- Home services demos
('home-leads', 'Lead Qualification', 'Automate lead scoring and appointment booking for service requests', 'home-services', 30, 15, 'intermediate', ARRAY['Convert 40% more leads', 'Reduce response time', 'Improve lead quality']),
('home-scheduling', 'Service Scheduling', 'Automate appointment booking and service reminder systems', 'home-services', 25, 12, 'beginner', ARRAY['Reduce no-shows by 60%', 'Optimize technician routes', 'Improve customer satisfaction']),
('home-estimates', 'Estimate Generation', 'Automate quote creation and proposal delivery', 'home-services', 35, 18, 'intermediate', ARRAY['Speed up quote process', 'Increase win rates', 'Improve proposal quality']),
('home-communication', 'Customer Communication', 'Automate customer updates throughout service lifecycle', 'home-services', 20, 10, 'beginner', ARRAY['Improve customer satisfaction', 'Reduce support calls', 'Build trust']),
('home-reviews', 'Review & Referral Automation', 'Automate review requests and referral program management', 'home-services', 25, 12, 'beginner', ARRAY['Increase positive reviews', 'Generate more referrals', 'Build online reputation'])
ON CONFLICT (id) DO NOTHING; 