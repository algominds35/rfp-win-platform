-- FINAL WORKING DATABASE SCRIPT - Using correct column names!

-- ========================================
-- CREATE THE MISSING TABLES (CORRECTED)
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create RFPs table - using 'id' to match your customers.id column
CREATE TABLE IF NOT EXISTS public.rfps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id BIGINT NOT NULL,  -- This will reference customers.id
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT[], 
    evaluation_criteria JSONB,
    budget_range TEXT,
    deadline TEXT,
    risk_factors TEXT[],
    strategy_recommendations TEXT[],
    file_name TEXT,
    file_size INTEGER,
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id BIGINT NOT NULL,  -- This will reference customers.id
    rfp_id UUID REFERENCES public.rfps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    client_name TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'won', 'lost', 'in_progress')),
    estimated_value DECIMAL(12,2),
    win_probability INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Usage Logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id BIGINT NOT NULL,  -- This will reference customers.id
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('rfp_upload', 'rfp_analysis', 'proposal_generation', 'api_call')),
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ADD INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_rfps_customer_id ON public.rfps(customer_id);
CREATE INDEX IF NOT EXISTS idx_rfps_created_at ON public.rfps(created_at);
CREATE INDEX IF NOT EXISTS idx_proposals_customer_id ON public.proposals(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_rfp_id ON public.proposals(rfp_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_customer_id ON public.usage_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON public.usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at);

-- ========================================
-- SET UP PERMISSIONS
-- ========================================

GRANT ALL ON public.rfps TO authenticated;
GRANT ALL ON public.proposals TO authenticated;
GRANT ALL ON public.usage_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow all operations on rfps" ON public.rfps;
DROP POLICY IF EXISTS "Allow all operations on proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow all operations on usage_logs" ON public.usage_logs;

CREATE POLICY "Allow all operations on rfps" ON public.rfps FOR ALL USING (true);
CREATE POLICY "Allow all operations on proposals" ON public.proposals FOR ALL USING (true);
CREATE POLICY "Allow all operations on usage_logs" ON public.usage_logs FOR ALL USING (true);

-- ========================================
-- ADD TEST DATA USING CORRECT CUSTOMER IDs
-- ========================================

DO $$
DECLARE
    rfp_id_1 UUID;
    rfp_id_2 UUID;
    rfp_id_3 UUID;
BEGIN
    -- Insert RFPs for customer ID 16 (test-pro@gmail.com)
    INSERT INTO public.rfps (customer_id, title, description, requirements, evaluation_criteria, budget_range, deadline, risk_factors, strategy_recommendations, file_name, created_at) 
    VALUES 
    (
        16,  -- Using the actual customer ID from your table
        'Cloud Infrastructure Migration Services',
        'Complete migration of legacy systems to AWS cloud infrastructure with high availability and security requirements',
        ARRAY['AWS expertise', 'Security compliance', '24/7 monitoring', 'Data migration', 'Zero downtime deployment'],
        '[{"criterion": "Technical approach", "weight": 40}, {"criterion": "Cost effectiveness", "weight": 30}, {"criterion": "Team experience", "weight": 20}, {"criterion": "Timeline feasibility", "weight": 10}]'::jsonb,
        '$500,000 - $750,000',
        '6 months',
        ARRAY['Tight timeline may require additional resources', 'Budget constraints could limit scope flexibility', 'Technical complexity requires specialized expertise'],
        ARRAY['Focus heavily on technical expertise and methodology', 'Emphasize cost-effective solutions with clear ROI', 'Highlight team certifications and relevant experience'],
        'cloud-migration-rfp.pdf',
        NOW() - INTERVAL '30 days'
    ) RETURNING id INTO rfp_id_1;

    INSERT INTO public.rfps (customer_id, title, description, requirements, evaluation_criteria, budget_range, deadline, risk_factors, strategy_recommendations, file_name, created_at) 
    VALUES 
    (
        17,  -- Using customer ID 17 (testpro123@gmail.com)
        'Enterprise Software Development Platform',
        'Custom enterprise application development with modern tech stack and agile methodology',
        ARRAY['React/Node.js expertise', 'Database design', 'API development', 'Testing automation', 'DevOps pipeline'],
        '[{"criterion": "Development methodology", "weight": 35}, {"criterion": "Technical skills", "weight": 30}, {"criterion": "Project timeline", "weight": 25}, {"criterion": "Cost structure", "weight": 10}]'::jsonb,
        '$200,000 - $400,000',
        '8 months',
        ARRAY['Complex integration requirements', 'Multiple stakeholder coordination needed', 'Scalability requirements may increase costs'],
        ARRAY['Showcase agile development experience', 'Demonstrate modern tech stack proficiency', 'Provide detailed project timeline with milestones'],
        'software-dev-rfp.pdf',
        NOW() - INTERVAL '20 days'
    ) RETURNING id INTO rfp_id_2;

    INSERT INTO public.rfps (customer_id, title, description, requirements, evaluation_criteria, budget_range, deadline, risk_factors, strategy_recommendations, file_name, created_at) 
    VALUES 
    (
        10,  -- Using customer ID 10 (demo-user)
        'Digital Marketing Automation Platform',
        'Comprehensive digital marketing platform with analytics, automation, and CRM integration',
        ARRAY['Marketing automation expertise', 'Analytics dashboard', 'CRM integration', 'Mobile responsiveness', 'Email marketing'],
        '[{"criterion": "Marketing expertise", "weight": 40}, {"criterion": "Technical implementation", "weight": 30}, {"criterion": "Analytics capabilities", "weight": 20}, {"criterion": "Support and training", "weight": 10}]'::jsonb,
        '$100,000 - $250,000',
        '4 months',
        ARRAY['Marketing requirements may change during development', 'Integration complexity with existing systems', 'User adoption challenges'],
        ARRAY['Highlight marketing automation success stories', 'Demonstrate analytics and reporting capabilities', 'Provide comprehensive training plan'],
        'marketing-platform-rfp.pdf',
        NOW() - INTERVAL '10 days'
    ) RETURNING id INTO rfp_id_3;

    -- Insert corresponding proposals
    INSERT INTO public.proposals (customer_id, rfp_id, title, content, client_name, status, estimated_value, win_probability, created_at) 
    VALUES 
    (
        16,
        rfp_id_1,
        'AWS Cloud Migration Proposal - TechCorp Inc',
        'Comprehensive cloud migration strategy with phased approach, security-first design, and 24/7 monitoring. Our team brings 10+ years of AWS expertise and has successfully migrated 50+ enterprise systems to the cloud.',
        'TechCorp Inc',
        'won',
        750000.00,
        95,
        NOW() - INTERVAL '28 days'
    ),
    (
        17,
        rfp_id_2,
        'Enterprise Software Platform Proposal - InnovateCorp',
        'Modern full-stack development using React, Node.js, and PostgreSQL. Agile methodology with 2-week sprints, comprehensive testing, and DevOps pipeline for continuous deployment.',
        'InnovateCorp',
        'in_progress',
        325000.00,
        80,
        NOW() - INTERVAL '18 days'
    ),
    (
        10,
        rfp_id_3,
        'Marketing Automation Proposal - GrowthMax',
        'Complete marketing automation solution with advanced analytics, CRM integration, and mobile-first design. Includes training program and 6-month support package.',
        'GrowthMax',
        'submitted',
        175000.00,
        70,
        NOW() - INTERVAL '8 days'
    );

    -- Insert usage logs
    INSERT INTO public.usage_logs (customer_id, user_email, action, resource_id, metadata, created_at) 
    VALUES 
    (16, 'test-pro@gmail.com', 'rfp_analysis', rfp_id_1, '{"filename": "cloud-migration-rfp.pdf", "file_size": 2048576, "analysis_duration": 45}', NOW() - INTERVAL '30 days'),
    (16, 'test-pro@gmail.com', 'proposal_generation', rfp_id_1, '{"rfp_title": "Cloud Infrastructure Migration", "proposal_length": 4500, "generation_time": 120}', NOW() - INTERVAL '28 days'),
    (17, 'testpro123@gmail.com', 'rfp_analysis', rfp_id_2, '{"filename": "software-dev-rfp.pdf", "file_size": 1536000, "analysis_duration": 38}', NOW() - INTERVAL '20 days'),
    (17, 'testpro123@gmail.com', 'proposal_generation', rfp_id_2, '{"rfp_title": "Enterprise Software Development", "proposal_length": 3200, "generation_time": 95}', NOW() - INTERVAL '18 days'),
    (10, 'demo-user', 'rfp_analysis', rfp_id_3, '{"filename": "marketing-platform-rfp.pdf", "file_size": 1024000, "analysis_duration": 32}', NOW() - INTERVAL '10 days'),
    (10, 'demo-user', 'proposal_generation', rfp_id_3, '{"rfp_title": "Digital Marketing Platform", "proposal_length": 2800, "generation_time": 85}', NOW() - INTERVAL '8 days');

    RAISE NOTICE 'SUCCESS: Added test data for all customers!';
END $$;

-- ========================================
-- VERIFICATION
-- ========================================

SELECT 'FINAL VERIFICATION - EVERYTHING SHOULD WORK NOW!' as status;
SELECT 
    (SELECT COUNT(*) FROM public.customers) as customers_exist,
    (SELECT COUNT(*) FROM public.rfps) as rfps_created,
    (SELECT COUNT(*) FROM public.proposals) as proposals_created,
    (SELECT COUNT(*) FROM public.usage_logs) as usage_logs_created;

-- Show what was created
SELECT 'RFP DATA' as type, title, budget_range FROM public.rfps LIMIT 3;
SELECT 'PROPOSAL DATA' as type, title, status, estimated_value FROM public.proposals LIMIT 3;
SELECT 'USAGE DATA' as type, action, user_email FROM public.usage_logs LIMIT 3;

SELECT '🎉 DATABASE SETUP COMPLETE! Your dashboard should now show real data!' as final_status; 