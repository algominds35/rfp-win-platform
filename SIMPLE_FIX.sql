-- SIMPLE DATABASE FIX - Let's see what we're working with first

-- ========================================
-- STEP 1: DISCOVER YOUR TABLE STRUCTURE
-- ========================================

-- Show customers table structure
SELECT 'YOUR CUSTOMERS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample customer data
SELECT 'YOUR CUSTOMERS TABLE DATA:' as info;
SELECT * FROM public.customers LIMIT 3;

-- ========================================
-- STEP 2: CREATE TABLES (SIMPLE VERSION)
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create RFPs table - using 'user_id' to match what your customers table likely has
CREATE TABLE IF NOT EXISTS public.rfps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL,  -- Changed from customer_id to user_id
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
    user_id BIGINT NOT NULL,  -- Changed from customer_id to user_id
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
    user_id BIGINT NOT NULL,  -- Changed from customer_id to user_id
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('rfp_upload', 'rfp_analysis', 'proposal_generation', 'api_call')),
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 3: ADD PERMISSIONS
-- ========================================

GRANT ALL ON public.rfps TO authenticated;
GRANT ALL ON public.proposals TO authenticated;
GRANT ALL ON public.usage_logs TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Simple policies (allow all for now)
DROP POLICY IF EXISTS "Allow all operations on rfps" ON public.rfps;
DROP POLICY IF EXISTS "Allow all operations on proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow all operations on usage_logs" ON public.usage_logs;

CREATE POLICY "Allow all operations on rfps" ON public.rfps FOR ALL USING (true);
CREATE POLICY "Allow all operations on proposals" ON public.proposals FOR ALL USING (true);
CREATE POLICY "Allow all operations on usage_logs" ON public.usage_logs FOR ALL USING (true);

-- ========================================
-- STEP 4: SIMPLE SUCCESS MESSAGE
-- ========================================

SELECT 'TABLES CREATED SUCCESSFULLY!' as status;
SELECT 'Now check the output above to see your customers table structure.' as next_step;
SELECT 'We will add test data in the next step once we know the correct column names.' as note; 