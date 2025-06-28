-- ===============================================
-- FIXED PRODUCTION DATABASE SETUP FOR RFP WIN PLATFORM
-- Ready for 9-Figure Scaling ($10M+ ARR)
-- ===============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===============================================
-- 1. ENHANCED CUSTOMERS TABLE
-- ===============================================
ALTER TABLE customers ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT uuid_generate_v4();
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- ===============================================
-- 2. COMPANY PROFILES TABLE (NEW)
-- ===============================================
CREATE TABLE IF NOT EXISTS company_profiles (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    capabilities TEXT[] DEFAULT '{}',
    team_size INTEGER DEFAULT 0,
    budget_range VARCHAR(100) DEFAULT '',
    contact_info JSONB DEFAULT '{}',
    industry VARCHAR(100),
    company_size VARCHAR(50),
    founded_year INTEGER,
    headquarters VARCHAR(255),
    website VARCHAR(500),
    description TEXT,
    certifications TEXT[],
    past_projects JSONB DEFAULT '[]',
    specializations TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one profile per customer
    UNIQUE(customer_id)
);

-- ===============================================
-- 3. ENHANCED RFPS TABLE
-- ===============================================
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT uuid_generate_v4();
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS client_industry VARCHAR(100);
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS project_type VARCHAR(100);
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(100);
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS file_name VARCHAR(500);
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS file_url VARCHAR(1000);
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS analysis_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS analysis_confidence DECIMAL(3,2);
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS key_requirements JSONB DEFAULT '[]';
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS compliance_requirements JSONB DEFAULT '[]';
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS technical_requirements JSONB DEFAULT '[]';
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS submission_deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS award_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE rfps ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ===============================================
-- 4. ENHANCED PROPOSALS TABLE
-- ===============================================
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT uuid_generate_v4();
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS executive_summary TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS technical_approach TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS timeline TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS budget_breakdown JSONB DEFAULT '{}';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS team_composition JSONB DEFAULT '{}';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS risk_assessment TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS compliance_matrix JSONB DEFAULT '{}';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS key_differentiators TEXT[];
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS win_probability DECIMAL(3,2);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS generation_model VARCHAR(50) DEFAULT 'gpt-4';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS generation_tokens INTEGER;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS generation_cost DECIMAL(10,4);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS outcome VARCHAR(50);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS outcome_notes TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ===============================================
-- 5. USAGE LOGS TABLE (NEW)
-- ===============================================
CREATE TABLE IF NOT EXISTS usage_logs (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id INTEGER,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 6. PAYMENT TRANSACTIONS TABLE (NEW)
-- ===============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 7. SYSTEM METRICS TABLE (NEW)
-- ===============================================
CREATE TABLE IF NOT EXISTS system_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50),
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INDEXES FOR PERFORMANCE (9-Figure Scale Ready)
-- ===============================================

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_plan_type ON customers(plan_type);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Company profiles indexes
CREATE INDEX IF NOT EXISTS idx_company_profiles_customer_id ON company_profiles(customer_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_industry ON company_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_company_profiles_company_size ON company_profiles(company_size);

-- RFPs table indexes
CREATE INDEX IF NOT EXISTS idx_rfps_customer_id ON rfps(customer_id);
CREATE INDEX IF NOT EXISTS idx_rfps_created_at ON rfps(created_at);
CREATE INDEX IF NOT EXISTS idx_rfps_deadline ON rfps(deadline);
CREATE INDEX IF NOT EXISTS idx_rfps_status ON rfps(analysis_status);
CREATE INDEX IF NOT EXISTS idx_rfps_client_industry ON rfps(client_industry);

-- Proposals table indexes
CREATE INDEX IF NOT EXISTS idx_proposals_customer_id ON proposals(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_rfp_id ON proposals(rfp_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at);
CREATE INDEX IF NOT EXISTS idx_proposals_win_probability ON proposals(win_probability);

-- Usage logs indexes (for analytics)
CREATE INDEX IF NOT EXISTS idx_usage_logs_customer_id ON usage_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action_type ON usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer_id ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_payment_intent ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- System metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_time ON system_metrics(metric_name, recorded_at);

-- ===============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ===============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
        CREATE TRIGGER update_customers_updated_at 
            BEFORE UPDATE ON customers 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_profiles_updated_at') THEN
        CREATE TRIGGER update_company_profiles_updated_at 
            BEFORE UPDATE ON company_profiles 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rfps_updated_at') THEN
        CREATE TRIGGER update_rfps_updated_at 
            BEFORE UPDATE ON rfps 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_proposals_updated_at') THEN
        CREATE TRIGGER update_proposals_updated_at 
            BEFORE UPDATE ON proposals 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ===============================================
-- SAMPLE DATA FOR PRODUCTION DEMO
-- ===============================================

-- Insert demo customer if not exists
INSERT INTO customers (email, first_name, last_name, company, plan_type, analyses_limit, analyses_used)
VALUES ('demo-user@example.com', 'Demo', 'User', 'TechFlow Solutions', 'professional', 250, 5)
ON CONFLICT (email) DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    analyses_limit = EXCLUDED.analyses_limit,
    updated_at = NOW();

-- Insert company profile for demo user
INSERT INTO company_profiles (
    customer_id, 
    name, 
    capabilities, 
    team_size, 
    budget_range, 
    industry,
    company_size,
    website,
    description,
    specializations,
    contact_info
)
SELECT 
    c.id,
    'TechFlow Solutions',
    ARRAY['Full-Stack Development', 'Cloud Architecture', 'AI/ML Integration', 'DevOps', 'Mobile Development', 'Cybersecurity', 'Data Analytics'],
    25,
    '$75,000 - $500,000',
    'Technology Services',
    'Small-Medium Business',
    'https://techflow.com',
    'Leading technology consultancy specializing in enterprise digital transformation and AI-powered solutions.',
    ARRAY['Enterprise Software', 'Cloud Migration', 'AI Implementation', 'Digital Transformation'],
    '{"website": "https://techflow.com", "email": "contact@techflow.com", "phone": "+1-555-0123", "linkedin": "https://linkedin.com/company/techflow"}'::jsonb
FROM customers c 
WHERE c.email = 'demo-user@example.com'
ON CONFLICT (customer_id) DO UPDATE SET
    name = EXCLUDED.name,
    capabilities = EXCLUDED.capabilities,
    team_size = EXCLUDED.team_size,
    budget_range = EXCLUDED.budget_range,
    industry = EXCLUDED.industry,
    company_size = EXCLUDED.company_size,
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    specializations = EXCLUDED.specializations,
    contact_info = EXCLUDED.contact_info,
    updated_at = NOW();

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================
SELECT 'SUCCESS: Production database setup complete! All tables, indexes, and triggers created.' as result; 