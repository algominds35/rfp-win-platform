-- RFP Win Platform Database Schema v2 - FIXED VERSION
-- Compatible with existing customers table that uses BIGINT id
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DON'T recreate customers table - it already exists with BIGINT id
-- Just make sure it has the columns we need
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company TEXT;

-- Companies table (linked to customers with BIGINT)
DROP TABLE IF EXISTS companies CASCADE;
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
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

-- RFPs table (using BIGINT for customer_id)
DROP TABLE IF EXISTS rfps CASCADE;
CREATE TABLE rfps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
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

-- Proposals table (using BIGINT for customer_id)
DROP TABLE IF EXISTS proposals CASCADE;
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
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

-- Usage tracking table (using BIGINT for customer_id)
DROP TABLE IF EXISTS usage_logs CASCADE;
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('rfp_upload', 'rfp_analysis', 'proposal_generation', 'api_call')),
  resource_id UUID, -- Could reference rfps.id or proposals.id
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table for dashboard metrics (using BIGINT for customer_id)
DROP TABLE IF EXISTS analytics CASCADE;
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('total_rfps', 'win_rate', 'pipeline_value', 'avg_response_time')),
  value DECIMAL(12,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_customer_id ON companies(customer_id);
CREATE INDEX IF NOT EXISTS idx_rfps_customer_id ON rfps(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_customer_id ON proposals(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_rfp_id ON proposals(rfp_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_customer_id ON usage_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_analytics_customer_id ON analytics(customer_id);

-- Function for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_rfps_updated_at ON rfps;
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rfps_updated_at BEFORE UPDATE ON rfps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO rfps (customer_id, title, description, requirements, budget_range, created_at) 
SELECT 
  c.id,
  'Cloud Infrastructure Migration Services',
  'Complete migration of legacy systems to cloud infrastructure with high availability and security requirements.',
  ARRAY['AWS/Azure expertise', 'Security compliance', '24/7 support', 'Data migration'],
  '$500K - $1M',
  NOW() - INTERVAL '30 days'
FROM customers c WHERE c.email = 'demo-user@example.com' LIMIT 1;

INSERT INTO rfps (customer_id, title, description, requirements, budget_range, created_at)
SELECT 
  c.id,
  'Enterprise Software Development',
  'Custom enterprise application development with modern tech stack and agile methodology.',
  ARRAY['React/Node.js', 'Database design', 'API development', 'Testing'],
  '$200K - $400K',
  NOW() - INTERVAL '15 days'
FROM customers c WHERE c.email = 'demo-user@example.com' LIMIT 1;

INSERT INTO rfps (customer_id, title, description, requirements, budget_range, created_at)
SELECT 
  c.id,
  'Digital Marketing Platform',
  'Comprehensive digital marketing platform with analytics and automation features.',
  ARRAY['Marketing automation', 'Analytics dashboard', 'CRM integration', 'Mobile app'],
  '$100K - $250K',
  NOW() - INTERVAL '7 days'
FROM customers c WHERE c.email = 'demo-user@example.com' LIMIT 1;

-- Insert corresponding proposals
INSERT INTO proposals (customer_id, rfp_id, title, content, win_probability, estimated_value, status, client_name, created_at)
SELECT 
  r.customer_id,
  r.id,
  'Proposal: ' || r.title,
  'Comprehensive proposal for ' || r.title || ' with detailed technical approach and timeline.',
  85,
  750000.00,
  'won',
  'ABC Corporation',
  r.created_at + INTERVAL '2 days'
FROM rfps r WHERE r.title = 'Cloud Infrastructure Migration Services';

INSERT INTO proposals (customer_id, rfp_id, title, content, win_probability, estimated_value, status, client_name, created_at)
SELECT 
  r.customer_id,
  r.id,
  'Proposal: ' || r.title,
  'Detailed proposal for ' || r.title || ' with modern development approach.',
  70,
  300000.00,
  'in_progress',
  'XYZ Industries',
  r.created_at + INTERVAL '1 day'
FROM rfps r WHERE r.title = 'Enterprise Software Development';

INSERT INTO proposals (customer_id, rfp_id, title, content, win_probability, estimated_value, status, client_name, created_at)
SELECT 
  r.customer_id,
  r.id,
  'Proposal: ' || r.title,
  'Marketing platform proposal with comprehensive feature set.',
  60,
  175000.00,
  'submitted',
  'Marketing Plus LLC',
  r.created_at + INTERVAL '3 days'
FROM rfps r WHERE r.title = 'Digital Marketing Platform';

-- Insert usage logs
INSERT INTO usage_logs (customer_id, action, metadata, created_at)
SELECT 
  c.id,
  'rfp_upload',
  jsonb_build_object('filename', 'cloud-migration-rfp.pdf', 'size', 2048576),
  NOW() - INTERVAL '30 days'
FROM customers c WHERE c.email = 'demo-user@example.com';

INSERT INTO usage_logs (customer_id, action, metadata, created_at)
SELECT 
  c.id,
  'proposal_generation',
  jsonb_build_object('rfp_title', 'Cloud Infrastructure Migration Services', 'proposal_length', 4500),
  NOW() - INTERVAL '28 days'
FROM customers c WHERE c.email = 'demo-user@example.com';

-- Function to calculate customer analytics (updated for BIGINT)
CREATE OR REPLACE FUNCTION calculate_customer_analytics(customer_bigint BIGINT, start_date DATE, end_date DATE)
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
  WHERE r.customer_id = customer_bigint
    AND r.created_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql; 