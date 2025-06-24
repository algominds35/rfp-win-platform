-- Fix Missing Tables - FINAL CORRECTED VERSION (No Array Errors)
-- Run this in Supabase SQL Editor

-- Drop existing tables if they have issues
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS rfps CASCADE;

-- RFPs table (simplified - no arrays to avoid errors)
CREATE TABLE rfps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  budget_range TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID REFERENCES rfps(id) ON DELETE CASCADE,
  customer_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft',
  estimated_value DECIMAL(12,2),
  win_probability INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage logs table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id BIGINT NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rfps_customer_id ON rfps(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_rfp_id ON proposals(rfp_id);
CREATE INDEX IF NOT EXISTS idx_proposals_customer_id ON proposals(customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_customer_id ON usage_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_email ON usage_logs(user_email);

-- Add test data (completely safe format)
INSERT INTO rfps (customer_id, title, description, requirements, budget_range, status) VALUES
(1, 'Cloud Infrastructure Migration', 'Migrate legacy systems to cloud infrastructure', 'AWS expertise and security compliance required', '$50,000 - $100,000', 'open'),
(1, 'Mobile App Development', 'Build cross-platform mobile application', 'React Native and API integration skills needed', '$25,000 - $50,000', 'open'),
(1, 'Data Analytics Platform', 'Build comprehensive business intelligence dashboard', 'Python, SQL, and Tableau expertise required', '$75,000 - $150,000', 'pending');

-- Add corresponding proposals
INSERT INTO proposals (rfp_id, customer_id, title, content, status, estimated_value, win_probability) 
SELECT 
  r.id,
  r.customer_id,
  'Proposal for ' || r.title,
  'Professional proposal content for ' || r.title || '. We have extensive experience in this domain and can deliver exceptional results within the specified timeframe and budget. Our team brings proven expertise and a track record of successful implementations.',
  CASE 
    WHEN random() < 0.2 THEN 'won' 
    WHEN random() < 0.5 THEN 'pending' 
    ELSE 'draft' 
  END,
  (CASE 
    WHEN r.budget_range LIKE '%100,000%' THEN 85000.00
    WHEN r.budget_range LIKE '%50,000%' THEN 42000.00
    ELSE 125000.00
  END),
  (60 + (random() * 30))::INTEGER
FROM rfps r;

-- Add some usage logs
INSERT INTO usage_logs (customer_id, user_email, action, metadata) VALUES
(1, 'demo-user@example.com', 'rfp_analysis', '{"rfp_title": "Cloud Infrastructure Migration"}'),
(1, 'demo-user@example.com', 'proposal_generation', '{"rfp_title": "Mobile App Development", "proposal_length": 2500}'),
(1, 'algomind6@gmail.com', 'rfp_analysis', '{"rfp_title": "Data Analytics Platform"}');

-- Verify tables were created
SELECT 
  'SUCCESS: All tables created!' as status,
  (SELECT COUNT(*) FROM rfps) as rfps_count,
  (SELECT COUNT(*) FROM proposals) as proposals_count,
  (SELECT COUNT(*) FROM usage_logs) as usage_logs_count; 