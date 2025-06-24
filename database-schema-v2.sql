-- RFP Win Platform Database Schema v2
-- Updated to match the customers table structure used in the application
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS analytics CASCADE;
-- DROP TABLE IF EXISTS usage_logs CASCADE;
-- DROP TABLE IF EXISTS proposals CASCADE;
-- DROP TABLE IF EXISTS rfps CASCADE;
-- DROP TABLE IF EXISTS companies CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Customers table (main user table with built-in Supabase Auth integration)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')),
  analyses_limit INTEGER NOT NULL DEFAULT 3,
  analyses_used INTEGER DEFAULT 0,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table (linked to customers)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team_size TEXT,
  industry TEXT,
  capabilities TEXT[],
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  address TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFPs table
CREATE TABLE IF NOT EXISTS rfps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  evaluation_criteria TEXT[],
  budget_range TEXT,
  deadline DATE,
  risk_factors TEXT[],
  recommendations TEXT[],
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  file_name TEXT,
  file_size INTEGER,
  extracted_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  rfp_id UUID REFERENCES rfps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  executive_summary TEXT,
  technical_approach TEXT,
  timeline TEXT,
  team_qualifications TEXT,
  win_probability INTEGER CHECK (win_probability >= 0 AND win_probability <= 100),
  estimated_value DECIMAL(12,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'won', 'lost', 'in_progress')),
  client_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('rfp_upload', 'rfp_analysis', 'proposal_generation', 'api_call')),
  resource_id UUID, -- Could reference rfps.id or proposals.id
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table for dashboard metrics
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('total_rfps', 'win_rate', 'pipeline_value', 'avg_response_time')),
  value DECIMAL(12,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_companies_customer_id ON companies(customer_id);
CREATE INDEX IF NOT EXISTS idx_rfps_customer_id ON rfps(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_customer_id ON proposals(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_rfp_id ON proposals(rfp_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_customer_id ON usage_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_analytics_customer_id ON analytics(customer_id);

-- Row Level Security (RLS) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (customers can only access their own data)
CREATE POLICY "Customers can view own data" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Customers can update own data" ON customers FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Customers can view own companies" ON companies FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Customers can view own rfps" ON rfps FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Customers can view own proposals" ON proposals FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Customers can view own usage" ON usage_logs FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Customers can view own analytics" ON analytics FOR ALL USING (customer_id = auth.uid());

-- Function for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_rfps_updated_at ON rfps;
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rfps_updated_at BEFORE UPDATE ON rfps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO customers (email, first_name, last_name, company, plan_type, analyses_limit, analyses_used) 
VALUES 
  ('test@example.com', 'John', 'Doe', 'Test Company', 'free', 3, 0),
  ('demo@techcorp.com', 'Jane', 'Smith', 'TechCorp Solutions', 'pro', 250, 16),
  ('ceo@techcorp.com', 'Mike', 'Johnson', 'TechCorp Solutions', 'basic', 25, 12)
ON CONFLICT (email) DO NOTHING;

-- Function to calculate customer analytics
CREATE OR REPLACE FUNCTION calculate_customer_analytics(customer_uuid UUID, start_date DATE, end_date DATE)
RETURNS TABLE(
  total_rfps BIGINT,
  win_rate DECIMAL,
  pipeline_value DECIMAL,
  avg_response_time DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(r.id) as total_rfps,
    COALESCE(
      (COUNT(p.id) FILTER (WHERE p.status = 'won')::DECIMAL / 
       NULLIF(COUNT(p.id), 0) * 100), 
      0
    ) as win_rate,
    COALESCE(SUM(p.estimated_value), 0) as pipeline_value,
    COALESCE(AVG(EXTRACT(EPOCH FROM (p.created_at - r.created_at)) / 3600), 0) as avg_response_time
  FROM rfps r
  LEFT JOIN proposals p ON r.id = p.rfp_id
  WHERE r.customer_id = customer_uuid
    AND r.created_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql; 