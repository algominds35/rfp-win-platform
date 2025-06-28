-- Create company_profiles table for storing user company information
CREATE TABLE IF NOT EXISTS company_profiles (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capabilities TEXT[] DEFAULT '{}',
    team_size INTEGER DEFAULT 0,
    budget_range TEXT DEFAULT '',
    contact_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one profile per customer
    UNIQUE(customer_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_profiles_customer_id ON company_profiles(customer_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_profiles_updated_at 
    BEFORE UPDATE ON company_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for demo user
INSERT INTO company_profiles (customer_id, name, capabilities, team_size, budget_range, contact_info)
SELECT 
    c.id,
    'TechFlow Solutions',
    ARRAY['Full-Stack Development', 'Cloud Architecture', 'AI/ML Integration', 'DevOps', 'Mobile Development'],
    15,
    '$50,000 - $250,000',
    '{"website": "https://techflow.com", "email": "contact@techflow.com", "phone": "+1-555-0123"}'::jsonb
FROM customers c 
WHERE c.email = 'demo-user@example.com'
ON CONFLICT (customer_id) DO NOTHING; 