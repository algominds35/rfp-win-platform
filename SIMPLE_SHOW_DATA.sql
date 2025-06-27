-- Just show what's actually in your tables - no assumptions

-- Show all RFP data
SELECT 'ALL RFP DATA:' as info;
SELECT * FROM public.rfps LIMIT 10;

-- Show all proposal data  
SELECT 'ALL PROPOSAL DATA:' as info;
SELECT * FROM public.proposals LIMIT 10;

-- Show all usage logs
SELECT 'ALL USAGE LOGS:' as info;
SELECT * FROM public.usage_logs LIMIT 10;

-- Count data per table
SELECT 'DATA COUNTS:' as info;
SELECT 
    (SELECT COUNT(*) FROM public.rfps) as total_rfps,
    (SELECT COUNT(*) FROM public.proposals) as total_proposals,
    (SELECT COUNT(*) FROM public.usage_logs) as total_usage_logs,
    (SELECT COUNT(*) FROM public.customers) as total_customers; 