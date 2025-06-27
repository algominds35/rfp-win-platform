-- SUPER SIMPLE FIX - No foreign key references to avoid column issues

-- ========================================
-- STEP 1: CREATE TABLES WITHOUT REFERENCES
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create RFPs table (no foreign key constraints)
CREATE TABLE IF NOT EXISTS public.rfps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id BIGINT,
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

-- Create Proposals table (no foreign key constraints)
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id BIGINT,
    rfp_id UUID,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    client_name TEXT,
    status TEXT DEFAULT 'draft',
    estimated_value DECIMAL(12,2),
    win_probability INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Usage Logs table (no foreign key constraints)
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id BIGINT,
    user_email TEXT,
    action TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 2: ADD PERMISSIONS
-- ========================================

GRANT ALL ON public.rfps TO authenticated;
GRANT ALL ON public.proposals TO authenticated;
GRANT ALL ON public.usage_logs TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Allow all operations on rfps" ON public.rfps FOR ALL USING (true);
CREATE POLICY "Allow all operations on proposals" ON public.proposals FOR ALL USING (true);
CREATE POLICY "Allow all operations on usage_logs" ON public.usage_logs FOR ALL USING (true);

-- ========================================
-- STEP 3: CHECK WHAT WE CREATED
-- ========================================

SELECT 'TABLES CREATED SUCCESSFULLY!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('rfps', 'proposals', 'usage_logs');

SELECT 'Ready to add test data in next step!' as next_step; 