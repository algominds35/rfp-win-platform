-- ===============================================
-- STEP-BY-STEP DATABASE FIX FOR RFP WIN PLATFORM
-- This will safely add missing columns and tables
-- ===============================================

-- First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check customers table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- Check if rfps table has customer_id
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rfps' 
ORDER BY ordinal_position;

-- Check if proposals table has customer_id  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'proposals' 
ORDER BY ordinal_position; 