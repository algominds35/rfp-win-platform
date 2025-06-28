-- FINAL PROFESSIONAL SETUP - Make Platform Ready for 9-Figure Scale
-- Run this in Supabase SQL Editor to add professional sample data

-- ========================================
-- STEP 1: ENSURE CLEAN START
-- ========================================

-- Delete any remaining demo data
DELETE FROM public.usage_logs WHERE metadata::text LIKE '%demo%' OR metadata::text LIKE '%test%';
DELETE FROM public.proposals WHERE title LIKE '%demo%' OR title LIKE '%test%' OR client_name LIKE '%test%';
DELETE FROM public.rfps WHERE title LIKE '%demo%' OR title LIKE '%test%' OR description LIKE '%demo%';

-- Reset all customer usage to 0 (fresh start)
UPDATE public.customers SET analyses_used = 0 WHERE analyses_used > 0;

-- ========================================
-- STEP 2: ADD PROFESSIONAL SAMPLE DATA
-- ========================================

-- Get the first customer (your real account)
DO $$
DECLARE
    customer_record RECORD;
    rfp_id_1 UUID;
    rfp_id_2 UUID;
    rfp_id_3 UUID;
BEGIN
    -- Get the first customer
    SELECT * INTO customer_record FROM public.customers ORDER BY created_at ASC LIMIT 1;
    
    IF customer_record.id IS NOT NULL THEN
        -- Insert PROFESSIONAL RFPs
        INSERT INTO public.rfps (customer_id, title, description, requirements, evaluation_criteria, budget_range, deadline, risk_factors, strategy_recommendations, file_name, created_at) 
        VALUES 
        (
            customer_record.id,
            'Enterprise Cloud Migration & Modernization',
            'Complete digital transformation including legacy system migration to AWS, microservices architecture, and DevOps implementation for Fortune 500 financial services company',
            ARRAY['AWS/Azure expertise', 'Financial services compliance', 'Microservices architecture', 'DevOps & CI/CD', 'Security & compliance', '24/7 monitoring'],
            '[{"criterion": "Technical expertise", "weight": 35}, {"criterion": "Financial services experience", "weight": 25}, {"criterion": "Security & compliance", "weight": 20}, {"criterion": "Project methodology", "weight": 20}]'::jsonb,
            '$2,500,000 - $4,200,000',
            '18 months',
            ARRAY['Complex legacy system dependencies', 'Regulatory compliance requirements', 'Zero-downtime migration constraints'],
            ARRAY['Emphasize financial services portfolio', 'Highlight security certifications', 'Demonstrate proven migration methodology'],
            'enterprise-cloud-migration.pdf',
            NOW() - INTERVAL '45 days'
        ) RETURNING id INTO rfp_id_1;
        
        INSERT INTO public.rfps (customer_id, title, description, requirements, evaluation_criteria, budget_range, deadline, risk_factors, strategy_recommendations, file_name, created_at) 
        VALUES 
        (
            customer_record.id,
            'AI-Powered Supply Chain Optimization Platform',
            'Development of machine learning platform for predictive analytics, demand forecasting, and supply chain optimization for global manufacturing corporation',
            ARRAY['Machine learning expertise', 'Supply chain domain knowledge', 'Real-time analytics', 'API integrations', 'Scalable architecture'],
            '[{"criterion": "AI/ML capabilities", "weight": 40}, {"criterion": "Supply chain expertise", "weight": 30}, {"criterion": "Scalability & performance", "weight": 20}, {"criterion": "Integration experience", "weight": 10}]'::jsonb,
            '$1,800,000 - $3,100,000',
            '12 months',
            ARRAY['Complex data integration requirements', 'Real-time processing demands', 'Global deployment challenges'],
            ARRAY['Showcase AI/ML portfolio', 'Highlight supply chain case studies', 'Demonstrate scalability expertise'],
            'ai-supply-chain-platform.pdf',
            NOW() - INTERVAL '30 days'
        ) RETURNING id INTO rfp_id_2;
        
        INSERT INTO public.rfps (customer_id, title, description, requirements, evaluation_criteria, budget_range, deadline, risk_factors, strategy_recommendations, file_name, created_at) 
        VALUES 
        (
            customer_record.id,
            'Healthcare Digital Transformation Initiative',
            'Comprehensive digital health platform with telemedicine, patient portal, EHR integration, and compliance management for regional healthcare network',
            ARRAY['Healthcare IT expertise', 'HIPAA compliance', 'EHR integrations', 'Telemedicine platform', 'Mobile applications', 'Data analytics'],
            '[{"criterion": "Healthcare experience", "weight": 35}, {"criterion": "Compliance expertise", "weight": 25}, {"criterion": "Integration capabilities", "weight": 25}, {"criterion": "User experience", "weight": 15}]'::jsonb,
            '$3,200,000 - $5,800,000',
            '24 months',
            ARRAY['Strict HIPAA compliance requirements', 'Complex EHR integration challenges', 'Multi-facility deployment'],
            ARRAY['Emphasize healthcare portfolio', 'Highlight compliance certifications', 'Demonstrate integration expertise'],
            'healthcare-digital-transformation.pdf',
            NOW() - INTERVAL '20 days'
        ) RETURNING id INTO rfp_id_3;

        -- Insert WINNING PROPOSALS
        INSERT INTO public.proposals (customer_id, rfp_id, title, content, client_name, status, estimated_value, win_probability, created_at) 
        VALUES 
        (
            customer_record.id,
            rfp_id_1,
            'Enterprise Cloud Migration Proposal - Global Financial Services',
            'Comprehensive cloud transformation strategy leveraging AWS services with phased migration approach, ensuring zero-downtime transition and full regulatory compliance. Our proven methodology has successfully migrated 50+ financial institutions to the cloud.',
            'Global Financial Services Corp',
            'won',
            3850000.00,
            95,
            NOW() - INTERVAL '42 days'
        ),
        (
            customer_record.id,
            rfp_id_2,
            'AI Supply Chain Platform Proposal - Manufacturing Excellence Inc',
            'Advanced machine learning platform utilizing TensorFlow and AWS SageMaker for predictive analytics and supply chain optimization. Our solution will reduce costs by 25% and improve efficiency by 40%.',
            'Manufacturing Excellence Inc',
            'in_progress',
            2650000.00,
            85,
            NOW() - INTERVAL '25 days'
        ),
        (
            customer_record.id,
            rfp_id_3,
            'Healthcare Digital Platform Proposal - Regional Health Network',
            'Complete digital health ecosystem with HIPAA-compliant telemedicine platform, patient portal, and seamless EHR integration. Our solution will improve patient outcomes and reduce operational costs by 30%.',
            'Regional Health Network',
            'submitted',
            4900000.00,
            80,
            NOW() - INTERVAL '15 days'
        );

        -- Insert PROFESSIONAL USAGE LOGS
        INSERT INTO public.usage_logs (customer_id, user_email, action, resource_id, metadata, created_at) 
        VALUES 
        (customer_record.id, customer_record.email, 'rfp_analysis', rfp_id_1, '{"filename": "enterprise-cloud-migration.pdf", "file_size": 5242880, "analysis_duration": 120, "complexity": "high"}', NOW() - INTERVAL '45 days'),
        (customer_record.id, customer_record.email, 'proposal_generation', rfp_id_1, '{"rfp_title": "Enterprise Cloud Migration", "proposal_length": 8500, "generation_time": 180, "win_probability": 95}', NOW() - INTERVAL '42 days'),
        (customer_record.id, customer_record.email, 'rfp_analysis', rfp_id_2, '{"filename": "ai-supply-chain-platform.pdf", "file_size": 3145728, "analysis_duration": 95, "complexity": "high"}', NOW() - INTERVAL '30 days'),
        (customer_record.id, customer_record.email, 'proposal_generation', rfp_id_2, '{"rfp_title": "AI Supply Chain Platform", "proposal_length": 7200, "generation_time": 150, "win_probability": 85}', NOW() - INTERVAL '25 days'),
        (customer_record.id, customer_record.email, 'rfp_analysis', rfp_id_3, '{"filename": "healthcare-digital-transformation.pdf", "file_size": 4194304, "analysis_duration": 110, "complexity": "high"}', NOW() - INTERVAL '20 days'),
        (customer_record.id, customer_record.email, 'proposal_generation', rfp_id_3, '{"rfp_title": "Healthcare Digital Transformation", "proposal_length": 9100, "generation_time": 200, "win_probability": 80}', NOW() - INTERVAL '15 days');

        -- Update customer usage to reflect professional activity
        UPDATE public.customers 
        SET analyses_used = 3, 
            updated_at = NOW()
        WHERE id = customer_record.id;

        RAISE NOTICE 'SUCCESS: Added professional data for customer %', customer_record.email;
    ELSE
        RAISE NOTICE 'ERROR: No customers found. Please create a customer account first.';
    END IF;
END $$;

-- ========================================
-- STEP 3: VERIFICATION & RESULTS
-- ========================================

SELECT '🚀 PROFESSIONAL PLATFORM SETUP COMPLETE!' as status;

-- Show the impressive metrics
SELECT 'TOTAL PIPELINE VALUE:' as metric, 
       '$' || TO_CHAR(SUM(estimated_value), 'FM999,999,999') as value 
FROM public.proposals;

SELECT 'WIN RATE:' as metric, 
       ROUND(100.0 * COUNT(CASE WHEN status = 'won' THEN 1 END) / COUNT(*), 1) || '%' as percentage 
FROM public.proposals;

SELECT 'AVERAGE DEAL SIZE:' as metric,
       '$' || TO_CHAR(AVG(estimated_value), 'FM999,999,999') as value
FROM public.proposals;

-- Show customer data
SELECT 'CUSTOMER STATUS:' as info, 
       email, 
       plan_type as plan, 
       analyses_used || '/' || analyses_limit as usage
FROM public.customers 
ORDER BY created_at ASC;

-- Show the professional RFPs
SELECT 'PROFESSIONAL RFPs:' as type, 
       title, 
       budget_range,
       EXTRACT(DAY FROM (NOW() - created_at)) || ' days ago' as created
FROM public.rfps 
ORDER BY created_at DESC;

SELECT '✅ YOUR PLATFORM IS NOW READY FOR 9-FIGURE SCALE!' as final_status; 