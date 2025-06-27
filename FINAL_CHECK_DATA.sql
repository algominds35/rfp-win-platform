-- Final fixed version - join on email since customer_id contains emails

-- Show RFPs by customer (joining on email)
SELECT 'RFPs BY CUSTOMER:' as info;
SELECT r.customer_id as customer_email, c.id as customer_id, c.email, r.title, r.created_at
FROM public.rfps r
LEFT JOIN public.customers c ON r.customer_id = c.email
ORDER BY r.created_at DESC;

-- Show proposals by customer (joining on email)
SELECT 'PROPOSALS BY CUSTOMER:' as info;
SELECT p.customer_id as customer_email, c.id as customer_id, c.email, p.title, p.status, p.estimated_value, p.created_at
FROM public.proposals p
LEFT JOIN public.customers c ON p.customer_id = c.email
ORDER BY p.created_at DESC;

-- Show usage logs
SELECT 'USAGE LOGS:' as info;
SELECT ul.customer_id, ul.user_email, ul.action, ul.created_at
FROM public.usage_logs ul
ORDER BY ul.created_at DESC;

-- Show raw data to understand the structure
SELECT 'RAW RFP DATA:' as info;
SELECT customer_id, title, created_at FROM public.rfps LIMIT 5;

SELECT 'RAW PROPOSAL DATA:' as info;
SELECT customer_id, title, status FROM public.proposals LIMIT 5;

-- Summary: which customers have data vs which don't (joining on email)
SELECT 'SUMMARY - CUSTOMERS WITH DATA:' as info;
SELECT 
    c.id,
    c.email,
    c.plan_type,
    c.analyses_used,
    COUNT(DISTINCT r.id) as rfps_count,
    COUNT(DISTINCT p.id) as proposals_count
FROM public.customers c
LEFT JOIN public.rfps r ON r.customer_id = c.email
LEFT JOIN public.proposals p ON p.customer_id = c.email
GROUP BY c.id, c.email, c.plan_type, c.analyses_used
ORDER BY c.id;

-- Check for orphaned data (RFPs/proposals with emails not in customers table)
SELECT 'ORPHANED RFPS:' as info;
SELECT r.customer_id, r.title
FROM public.rfps r
LEFT JOIN public.customers c ON r.customer_id = c.email
WHERE c.email IS NULL;

SELECT 'ORPHANED PROPOSALS:' as info;
SELECT p.customer_id, p.title
FROM public.proposals p
LEFT JOIN public.customers c ON p.customer_id = c.email
WHERE c.email IS NULL; 