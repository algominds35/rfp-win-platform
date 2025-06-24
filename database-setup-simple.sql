-- Simple Database Setup for RFP Win Platform
-- Run this in your Supabase SQL Editor

-- Create RFPs table
CREATE TABLE IF NOT EXISTS public.rfps (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    deadline DATE,
    budget_range TEXT,
    status TEXT DEFAULT 'active',
    user_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
    id BIGSERIAL PRIMARY KEY,
    rfp_id BIGINT REFERENCES public.rfps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'draft',
    user_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Usage Logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for testing
INSERT INTO public.rfps (title, description, client_name, deadline, budget_range, user_email) VALUES
('Cloud Infrastructure Migration', 'Migrate legacy systems to cloud infrastructure', 'TechCorp Inc', '2025-07-15', '$50,000 - $100,000', 'algomind6@gmail.com'),
('AI-Powered Analytics Platform', 'Build custom analytics dashboard with AI insights', 'DataFlow Solutions', '2025-08-01', '$25,000 - $75,000', 'algomind6@gmail.com'),
('Mobile App Development', 'Cross-platform mobile application for e-commerce', 'RetailMax', '2025-07-30', '$30,000 - $60,000', 'algomind6@gmail.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.proposals (rfp_id, title, content, status, user_email) VALUES
(1, 'Cloud Migration Proposal - TechCorp', 'Comprehensive cloud migration strategy...', 'submitted', 'algomind6@gmail.com'),
(2, 'AI Analytics Platform Proposal', 'Custom AI-powered analytics solution...', 'draft', 'algomind6@gmail.com'),
(3, 'Mobile App Development Proposal', 'Cross-platform mobile app solution...', 'in_review', 'algomind6@gmail.com')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own RFPs" ON public.rfps FOR SELECT USING (user_email = auth.email());
CREATE POLICY "Users can insert their own RFPs" ON public.rfps FOR INSERT WITH CHECK (user_email = auth.email());
CREATE POLICY "Users can update their own RFPs" ON public.rfps FOR UPDATE USING (user_email = auth.email());

CREATE POLICY "Users can view their own proposals" ON public.proposals FOR SELECT USING (user_email = auth.email());
CREATE POLICY "Users can insert their own proposals" ON public.proposals FOR INSERT WITH CHECK (user_email = auth.email());
CREATE POLICY "Users can update their own proposals" ON public.proposals FOR UPDATE USING (user_email = auth.email());

CREATE POLICY "Users can view their own usage logs" ON public.usage_logs FOR SELECT USING (user_id = auth.email());
CREATE POLICY "Users can insert their own usage logs" ON public.usage_logs FOR INSERT WITH CHECK (user_id = auth.email());

-- Grant permissions
GRANT ALL ON public.rfps TO authenticated;
GRANT ALL ON public.proposals TO authenticated;
GRANT ALL ON public.usage_logs TO authenticated;
GRANT USAGE ON SEQUENCE public.rfps_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.proposals_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.usage_logs_id_seq TO authenticated; 