-- Fixed version - handles data type mismatch

-- Show RFPs by customer (with type casting)
SELECT 'RFPs BY CUSTOMER:' as info;
SELECT r.customer_id, c.email, r.title, r.created_at
FROM public.rfps r
JOIN public.customers c ON r.customer_id::bigint = c.id
ORDER BY r.created_at DESC;

-- Show proposals by customer (with type casting)
SELECT 'PROPOSALS BY CUSTOMER:' as info;
SELECT p.customer_id, c.email, p.title, p.status, p.estimated_value, p.created_at
FROM public.proposals p
JOIN public.customers c ON p.customer_id::bigint = c.id
ORDER BY p.created_at DESC;

-- Show usage logs (with type casting)
SELECT 'USAGE LOGS:' as info;
SELECT ul.customer_id, ul.user_email, ul.action, ul.created_at
FROM public.usage_logs ul
ORDER BY ul.created_at DESC;

-- Summary: which customers have data vs which don't (with type casting)
SELECT 'SUMMARY - CUSTOMERS WITH DATA:' as info;
SELECT 
    c.id,
    c.email,
    c.plan_type,
    c.analyses_used,
    COUNT(r.id) as rfps_count,
    COUNT(p.id) as proposals_count
FROM public.customers c
LEFT JOIN public.rfps r ON r.customer_id::bigint = c.id
LEFT JOIN public.proposals p ON p.customer_id::bigint = c.id
GROUP BY c.id, c.email, c.plan_type, c.analyses_used
ORDER BY c.id;

-- Also check what data types we actually have
SELECT 'DATA TYPE CHECK:' as info;
SELECT 
    'rfps.customer_id' as column_name,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'rfps' AND column_name = 'customer_id'
UNION ALL
SELECT 
    'customers.id' as column_name,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'id'; 