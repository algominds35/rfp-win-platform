-- CLEAN ALL DEMO DATA - Make Platform Professional
-- Run this in Supabase SQL Editor

-- ========================================
-- STEP 1: DELETE ALL DEMO/TEST DATA
-- ========================================

-- Delete demo RFPs (fake ones like "Cloud Infrastructure Migration")
DELETE FROM public.rfps 
WHERE title IN (
    'Cloud Infrastructure Migration',
    'Cloud Infrastructure Migration Services', 
    'AI Analytics Platform',
    'AI-Powered Analytics Platform',
    'Enterprise Software Development Platform',
    'Digital Marketing Automation Platform',
    'Digital Marketing Platform',
    'Mobile App Development',
    'Data Analytics Platform',
    'Enterprise Security Audit',
    'Digital Marketing Campaign',
    'IT Consulting Services'
);

-- Delete demo proposals
DELETE FROM public.proposals 
WHERE title LIKE '%TechCorp%' 
   OR title LIKE '%InnovateCorp%' 
   OR title LIKE '%GrowthMax%'
   OR title LIKE '%DataFlow%'
   OR title LIKE '%RetailMax%'
   OR client_name IN ('TechCorp Inc', 'DataFlow LLC', 'ABC Corporation', 'XYZ Industries', 'Marketing Plus LLC');

-- Delete demo usage logs
DELETE FROM public.usage_logs 
WHERE user_email IN ('demo-user', 'demo-user@example.com', 'test-pro@gmail.com', 'testpro123@gmail.com')
   OR action IN ('rfp_upload', 'proposal_download')
   OR metadata::text LIKE '%cloud-migration-rfp.pdf%'
   OR metadata::text LIKE '%software-dev-rfp.pdf%'
   OR metadata::text LIKE '%marketing-platform-rfp.pdf%';

-- ========================================
-- STEP 2: RESET USAGE COUNTS TO ACTUAL
-- ========================================

-- Reset all customers to 0 usage (they'll build real usage as they use the platform)
UPDATE public.customers 
SET analyses_used = 0, 
    updated_at = NOW()
WHERE analyses_used > 0;

-- ========================================
-- STEP 3: CLEAN UP ANY ORPHANED DATA
-- ========================================

-- Delete proposals without valid RFPs
DELETE FROM public.proposals 
WHERE rfp_id NOT IN (SELECT id FROM public.rfps);

-- Delete usage logs without valid customers
DELETE FROM public.usage_logs 
WHERE customer_id NOT IN (SELECT id FROM public.customers);

-- ========================================
-- STEP 4: VERIFICATION
-- ========================================

SELECT 'DEMO DATA CLEANUP COMPLETE!' as status;

-- Show remaining data (should be minimal/real only)
SELECT 'Remaining RFPs:' as type, COUNT(*) as count FROM public.rfps;
SELECT 'Remaining Proposals:' as type, COUNT(*) as count FROM public.proposals;
SELECT 'Remaining Usage Logs:' as type, COUNT(*) as count FROM public.usage_logs;

-- Show customer usage (should all be 0 now)
SELECT 'Customer Usage Reset:' as info, email, analyses_used, analyses_limit 
FROM public.customers 
ORDER BY created_at DESC;

SELECT '✅ PLATFORM IS NOW CLEAN AND PROFESSIONAL!' as final_status; 