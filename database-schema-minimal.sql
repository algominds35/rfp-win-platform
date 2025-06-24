-- Minimal Database Schema - Only Missing Tables
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- RFPs table (simple version)
CREATE TABLE IF NOT EXISTS rfps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  budget_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals table (simple version)  
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfp_id UUID,
  customer_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft',
  estimated_value DECIMAL(12,2),
  win_probability INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id BIGINT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Companies table (simple version)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id BIGINT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some basic test data
INSERT INTO rfps (customer_id, title, description, budget_range) VALUES
(1, 'Cloud Migration Services', 'Need help migrating to AWS cloud infrastructure', '$50,000 - $100,000'),
(1, 'Software Development Project', 'Custom web application development', '$25,000 - $50,000'),
(1, 'IT Consulting Services', 'Strategic IT planning and consulting', '$10,000 - $25,000');

INSERT INTO proposals (rfp_id, customer_id, title, content, status, estimated_value, win_probability) VALUES
((SELECT id FROM rfps WHERE title = 'Cloud Migration Services' LIMIT 1), 1, 'AWS Cloud Migration Proposal', 'Comprehensive cloud migration solution...', 'submitted', 75000.00, 85),
((SELECT id FROM rfps WHERE title = 'Software Development Project' LIMIT 1), 1, 'Custom Web App Proposal', 'Full-stack web application development...', 'won', 40000.00, 90),
((SELECT id FROM rfps WHERE title = 'IT Consulting Services' LIMIT 1), 1, 'IT Strategy Proposal', 'Strategic IT consulting and planning...', 'draft', 15000.00, 70);

INSERT INTO companies (customer_id, name, description) VALUES
(1, 'TechCorp Solutions', 'Leading technology consulting firm'),
(1, 'Digital Innovations Inc', 'Software development and digital transformation');

INSERT INTO usage_logs (customer_id, action, metadata) VALUES
(1, 'rfp_upload', '{"filename": "cloud-migration-rfp.pdf", "size": 1024}'),
(1, 'proposal_generation', '{"rfp_title": "Cloud Migration Services", "duration": 45}'),
(1, 'proposal_download', '{"proposal_id": "abc123", "format": "pdf"}');

-- Success message
SELECT 'All tables created successfully!' as result; 