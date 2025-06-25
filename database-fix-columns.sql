-- COMPLETE Database Fix for RFP Win Platform
-- Run this in your Supabase SQL Editor to fix ALL missing columns

-- Drop and recreate the rfps table with ALL required columns
DROP TABLE IF EXISTS public.rfps CASCADE;
CREATE TABLE public.rfps (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    deadline DATE,
    budget_range TEXT,
    status TEXT DEFAULT 'active',
    user_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id TEXT
);

-- Drop and recreate the proposals table with ALL required columns
DROP TABLE IF EXISTS public.proposals CASCADE;
CREATE TABLE public.proposals (
    id BIGSERIAL PRIMARY KEY,
    rfp_id BIGINT REFERENCES public.rfps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'draft',
    user_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id TEXT
);

-- Ensure usage_logs table exists
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for your paid account (algomind6@gmail.com)
INSERT INTO public.rfps (title, description, client_name, deadline, budget_range, user_email) VALUES
('Cloud Infrastructure Migration', 'Migrate legacy systems to cloud infrastructure with 99.9% uptime guarantee', 'TechCorp Inc', '2025-07-15', '$50,000 - $100,000', 'algomind6@gmail.com'),
('AI-Powered Analytics Platform', 'Build custom analytics dashboard with AI insights and real-time reporting', 'DataFlow Solutions', '2025-08-01', '$25,000 - $75,000', 'algomind6@gmail.com'),
('Mobile App Development', 'Cross-platform mobile application for e-commerce with payment integration', 'RetailMax', '2025-07-30', '$30,000 - $60,000', 'algomind6@gmail.com'),
('Enterprise Security Audit', 'Comprehensive cybersecurity assessment and penetration testing', 'SecureBank Corp', '2025-08-15', '$40,000 - $80,000', 'algomind6@gmail.com'),
('Digital Marketing Campaign', 'Multi-channel digital marketing strategy for Q3 product launch', 'StartupX', '2025-07-20', '$15,000 - $35,000', 'algomind6@gmail.com');

-- Insert corresponding proposals
INSERT INTO public.proposals (rfp_id, title, content, status, user_email) VALUES
(1, 'Cloud Migration Proposal - TechCorp', 'Comprehensive cloud migration strategy with AWS infrastructure, including disaster recovery, monitoring, and 24/7 support. Our team will ensure zero-downtime migration with rollback capabilities.', 'submitted', 'algomind6@gmail.com'),
(2, 'AI Analytics Platform Proposal', 'Custom AI-powered analytics solution using machine learning algorithms for predictive insights, real-time dashboards, and automated reporting capabilities.', 'draft', 'algomind6@gmail.com'),
(3, 'Mobile App Development Proposal', 'Cross-platform mobile app solution using React Native with integrated payment processing, user authentication, and push notifications.', 'in_review', 'algomind6@gmail.com'),
(4, 'Security Audit Proposal', 'Enterprise-grade security assessment including vulnerability scanning, penetration testing, and compliance reporting for financial regulations.', 'submitted', 'algomind6@gmail.com'),
(5, 'Digital Marketing Strategy', 'Comprehensive digital marketing campaign leveraging SEO, PPC, social media, and content marketing to drive 300% ROI.', 'won', 'algomind6@gmail.com');

-- Insert some usage logs for your account
INSERT INTO public.usage_logs (user_id, action, metadata) VALUES
('algomind6@gmail.com', 'rfp_analysis', '{"rfp_title": "Cloud Infrastructure Migration", "analysis_time": "2024-06-20T10:30:00Z"}'),
('algomind6@gmail.com', 'proposal_generation', '{"rfp_title": "AI Analytics Platform", "proposal_length": 2500, "generation_time": "2024-06-21T14:15:00Z"}'),
('algomind6@gmail.com', 'rfp_analysis', '{"rfp_title": "Mobile App Development", "analysis_time": "2024-06-22T09:45:00Z"}');

-- Grant permissions
GRANT ALL ON public.rfps TO authenticated;
GRANT ALL ON public.proposals TO authenticated;
GRANT ALL ON public.usage_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the tables were created successfully
SELECT 'RFPs table created with ' || COUNT(*) || ' sample records' as status FROM public.rfps;
SELECT 'Proposals table created with ' || COUNT(*) || ' sample records' as status FROM public.proposals;
SELECT 'Usage logs table created with ' || COUNT(*) || ' sample records' as status FROM public.usage_logs;

-- Add customer_id column to rfps table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rfps' AND column_name = 'customer_id') THEN
        ALTER TABLE public.rfps ADD COLUMN customer_id TEXT;
        RAISE NOTICE 'Added customer_id column to rfps table';
    ELSE
        RAISE NOTICE 'customer_id column already exists in rfps table';
    END IF;
END $$;

-- Add customer_id column to proposals table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'proposals' AND column_name = 'customer_id') THEN
        ALTER TABLE public.proposals ADD COLUMN customer_id TEXT;
        RAISE NOTICE 'Added customer_id column to proposals table';
    ELSE
        RAISE NOTICE 'customer_id column already exists in proposals table';
    END IF;
END $$;

-- Update existing records to have demo customer_id (if any exist)
UPDATE public.rfps SET customer_id = 'demo-user@example.com' WHERE customer_id IS NULL;
UPDATE public.proposals SET customer_id = 'demo-user@example.com' WHERE customer_id IS NULL;

-- Verify the changes
SELECT 'rfps' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rfps' AND column_name = 'customer_id'
UNION ALL
SELECT 'proposals' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'proposals' AND column_name = 'customer_id'; 