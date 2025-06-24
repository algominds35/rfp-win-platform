-- Fix Missing Tables - Simple Version
-- Run this in Supabase SQL Editor

-- RFPs table
CREATE TABLE IF NOT EXISTS rfps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  budget_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID REFERENCES rfps(id),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id BIGINT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Add some test data
INSERT INTO rfps (customer_id, title, description, requirements, budget_range) VALUES
(1, 'Cloud Infrastructure Migration', 'Migrate legacy systems to cloud', 'AWS expertise, security compliance', '$50,000 - $100,000'),
(1, 'Mobile App Development', 'Build iOS and Android app', 'React Native, API integration', '$25,000 - $50,000'),
(1, 'Data Analytics Platform', 'Build business intelligence dashboard', 'Python, SQL, Tableau', '$75,000 - $150,000');

INSERT INTO proposals (rfp_id, customer_id, title, content, status, estimated_value, win_probability) 
SELECT 
  r.id,
  r.customer_id,
  'Proposal for ' || r.title,
  'Professional proposal content for ' || r.title || '. We have extensive experience in this domain and can deliver exceptional results.',
  CASE WHEN random() < 0.3 THEN 'won' WHEN random() < 0.6 THEN 'pending' ELSE 'draft' END,
  (CASE 
    WHEN r.budget_range LIKE '%100,000%' THEN 85000
    WHEN r.budget_range LIKE '%50,000%' THEN 42000
    ELSE 125000
  END),
  (60 + (random() * 30))::INTEGER
FROM rfps r;

-- Success message
SELECT 'Missing tables created and populated with test data!' as result; 