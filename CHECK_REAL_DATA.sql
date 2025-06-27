-- Check which customers have actual data vs just accounts

-- Show RFPs by customer
SELECT 'RFPs BY CUSTOMER:' as info;
SELECT r.customer_id, c.email, r.title, r.created_at
FROM public.rfps r
JOIN public.customers c ON r.customer_id = c.id
ORDER BY r.created_at DESC;

-- Show proposals by customer  
SELECT 'PROPOSALS BY CUSTOMER:' as info;
SELECT p.customer_id, c.email, p.title, p.status, p.estimated_value, p.created_at
FROM public.proposals p
JOIN public.customers c ON p.customer_id = c.id
ORDER BY p.created_at DESC;

-- Show usage logs
SELECT 'USAGE LOGS:' as info;
SELECT ul.customer_id, ul.user_email, ul.action, ul.created_at
FROM public.usage_logs ul
ORDER BY ul.created_at DESC;

-- Summary: which customers have data vs which don't
SELECT 'SUMMARY - CUSTOMERS WITH DATA:' as info;
SELECT 
    c.id,
    c.email,
    c.plan_type,
    c.analyses_used,
    COUNT(r.id) as rfps_count,
    COUNT(p.id) as proposals_count
FROM public.customers c
LEFT JOIN public.rfps r ON c.id = r.customer_id
LEFT JOIN public.proposals p ON c.id = p.customer_id
GROUP BY c.id, c.email, c.plan_type, c.analyses_used
ORDER BY c.id; 