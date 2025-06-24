-- Create missing proposals table
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id BIGINT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some test data
INSERT INTO proposals (rfp_id, customer_id, title, content, status, estimated_value, win_probability) VALUES
((SELECT id FROM rfps WHERE title LIKE '%Cloud%' LIMIT 1), 1, 'AWS Cloud Migration Proposal', 'Comprehensive cloud migration solution...', 'submitted', 75000.00, 85),
((SELECT id FROM rfps WHERE title LIKE '%Software%' LIMIT 1), 1, 'Custom Web App Proposal', 'Full-stack web application development...', 'won', 40000.00, 90),
((SELECT id FROM rfps WHERE title LIKE '%IT%' LIMIT 1), 1, 'IT Strategy Proposal', 'Strategic IT consulting and planning...', 'draft', 15000.00, 70);

INSERT INTO usage_logs (customer_id, action, metadata) VALUES
(1, 'rfp_upload', '{"filename": "cloud-migration-rfp.pdf", "size": 1024}'),
(1, 'proposal_generation', '{"rfp_title": "Cloud Migration Services", "duration": 45}'),
(1, 'proposal_download', '{"proposal_id": "abc123", "format": "pdf"}');

-- Success message
SELECT 'Missing tables created successfully!' as result; 