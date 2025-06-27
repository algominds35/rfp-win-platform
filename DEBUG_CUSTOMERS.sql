-- Debug script to see what tables exist and what's in them

-- Check if customers table exists
SELECT 'CHECKING IF CUSTOMERS TABLE EXISTS:' as step;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'customers';

-- Show all tables in your database
SELECT 'ALL TABLES IN YOUR DATABASE:' as step;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check customers table structure if it exists
SELECT 'CUSTOMERS TABLE COLUMNS (if exists):' as step;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public';

-- Count customers
SELECT 'NUMBER OF CUSTOMERS:' as step;
SELECT COUNT(*) as customer_count FROM public.customers;

-- Show customers (if any)
SELECT 'CUSTOMER DATA:' as step;
SELECT * FROM public.customers LIMIT 3; 