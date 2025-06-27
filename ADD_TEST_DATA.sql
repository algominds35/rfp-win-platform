-- ADD TEST DATA - This is the important part that fixes your dashboard

-- First, let's clean up any policy conflicts
DROP POLICY IF EXISTS "Allow all operations on rfps" ON public.rfps;
DROP POLICY IF EXISTS "Allow all operations on proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow all operations on usage_logs" ON public.usage_logs;

-- Recreate policies
CREATE POLICY "Allow all operations on rfps" ON public.rfps FOR ALL USING (true);
CREATE POLICY "Allow all operations on proposals" ON public.proposals FOR ALL USING (true);  
CREATE POLICY "Allow all operations on usage_logs" ON public.usage_logs FOR ALL USING (true);

-- ========================================
-- ADD THE REAL TEST DATA (This fixes your dashboard!)
-- ========================================

-- Insert RFPs using your actual customer IDs
INSERT INTO public.rfps (customer_id, title, description, requirements, evaluation_criteria, budget_range, deadline, risk_factors, strategy_recommendations, file_name, created_at) 
VALUES 
(
    16,  -- Your customer ID from the table
    'Cloud Infrastructure Migration Services',
    'Complete migration of legacy systems to AWS cloud infrastructure with high availability and security requirements',
    ARRAY['AWS expertise', 'Security compliance', '24/7 monitoring', 'Data migration', 'Zero downtime deployment'],
    '[{"criterion": "Technical approach", "weight": 40}, {"criterion": "Cost effectiveness", "weight": 30}, {"criterion": "Team experience", "weight": 20}, {"criterion": "Timeline feasibility", "weight": 10}]'::jsonb,
    '$500,000 - $750,000',
    '6 months',
    ARRAY['Tight timeline may require additional resources', 'Budget constraints could limit scope flexibility', 'Technical complexity requires specialized expertise'],
    ARRAY['Focus heavily on technical expertise and methodology', 'Emphasize cost-effective solutions with clear ROI', 'Highlight team certifications and relevant experience'],
    'cloud-migration-rfp.pdf',
    NOW() - INTERVAL '30 days'
),
(
    17,  -- Second customer
    'Enterprise Software Development Platform', 
    'Custom enterprise application development with modern tech stack and agile methodology',
    ARRAY['React/Node.js expertise', 'Database design', 'API development', 'Testing automation', 'DevOps pipeline'],
    '[{"criterion": "Development methodology", "weight": 35}, {"criterion": "Technical skills", "weight": 30}, {"criterion": "Project timeline", "weight": 25}, {"criterion": "Cost structure", "weight": 10}]'::jsonb,
    '$200,000 - $400,000',
    '8 months',
    ARRAY['Complex integration requirements', 'Multiple stakeholder coordination needed', 'Scalability requirements may increase costs'],
    ARRAY['Showcase agile development experience', 'Demonstrate modern tech stack proficiency', 'Provide detailed project timeline with milestones'],
    'software-dev-rfp.pdf',
    NOW() - INTERVAL '20 days'
),
(
    10,  -- Third customer
    'Digital Marketing Automation Platform',
    'Comprehensive digital marketing platform with analytics, automation, and CRM integration',
    ARRAY['Marketing automation expertise', 'Analytics dashboard', 'CRM integration', 'Mobile responsiveness', 'Email marketing'],
    '[{"criterion": "Marketing expertise", "weight": 40}, {"criterion": "Technical implementation", "weight": 30}, {"criterion": "Analytics capabilities", "weight": 20}, {"criterion": "Support and training", "weight": 10}]'::jsonb,
    '$100,000 - $250,000',
    '4 months',
    ARRAY['Marketing requirements may change during development', 'Integration complexity with existing systems', 'User adoption challenges'],
    ARRAY['Highlight marketing automation success stories', 'Demonstrate analytics and reporting capabilities', 'Provide comprehensive training plan'],
    'marketing-platform-rfp.pdf',
    NOW() - INTERVAL '10 days'
);

-- Insert Proposals (this creates your pipeline value!)
INSERT INTO public.proposals (customer_id, rfp_id, title, content, client_name, status, estimated_value, win_probability, created_at) 
VALUES 
(
    16,
    (SELECT id FROM public.rfps WHERE title = 'Cloud Infrastructure Migration Services'),
    'AWS Cloud Migration Proposal - TechCorp Inc',
    'Comprehensive cloud migration strategy with phased approach, security-first design, and 24/7 monitoring. Our team brings 10+ years of AWS expertise and has successfully migrated 50+ enterprise systems to the cloud.',
    'TechCorp Inc',
    'won',
    750000.00,
    95,
    NOW() - INTERVAL '28 days'
),
(
    17,
    (SELECT id FROM public.rfps WHERE title = 'Enterprise Software Development Platform'),
    'Enterprise Software Platform Proposal - InnovateCorp',
    'Modern full-stack development using React, Node.js, and PostgreSQL. Agile methodology with 2-week sprints, comprehensive testing, and DevOps pipeline for continuous deployment.',
    'InnovateCorp',
    'in_progress',
    325000.00,
    80,
    NOW() - INTERVAL '18 days'
),
(
    10,
    (SELECT id FROM public.rfps WHERE title = 'Digital Marketing Automation Platform'),
    'Marketing Automation Proposal - GrowthMax',
    'Complete marketing automation solution with advanced analytics, CRM integration, and mobile-first design. Includes training program and 6-month support package.',
    'GrowthMax',
    'submitted',
    175000.00,
    70,
    NOW() - INTERVAL '8 days'
);

-- Insert Usage Logs (this makes usage tracking work!)
INSERT INTO public.usage_logs (customer_id, user_email, action, resource_id, metadata, created_at) 
VALUES 
(16, 'test-pro@gmail.com', 'rfp_analysis', (SELECT id FROM public.rfps WHERE customer_id = 16 LIMIT 1), '{"filename": "cloud-migration-rfp.pdf", "file_size": 2048576, "analysis_duration": 45}', NOW() - INTERVAL '30 days'),
(16, 'test-pro@gmail.com', 'proposal_generation', (SELECT id FROM public.rfps WHERE customer_id = 16 LIMIT 1), '{"rfp_title": "Cloud Infrastructure Migration", "proposal_length": 4500, "generation_time": 120}', NOW() - INTERVAL '28 days'),
(17, 'testpro123@gmail.com', 'rfp_analysis', (SELECT id FROM public.rfps WHERE customer_id = 17 LIMIT 1), '{"filename": "software-dev-rfp.pdf", "file_size": 1536000, "analysis_duration": 38}', NOW() - INTERVAL '20 days'),
(17, 'testpro123@gmail.com', 'proposal_generation', (SELECT id FROM public.rfps WHERE customer_id = 17 LIMIT 1), '{"rfp_title": "Enterprise Software Development", "proposal_length": 3200, "generation_time": 95}', NOW() - INTERVAL '18 days'),
(10, 'demo-user', 'rfp_analysis', (SELECT id FROM public.rfps WHERE customer_id = 10 LIMIT 1), '{"filename": "marketing-platform-rfp.pdf", "file_size": 1024000, "analysis_duration": 32}', NOW() - INTERVAL '10 days'),
(10, 'demo-user', 'proposal_generation', (SELECT id FROM public.rfps WHERE customer_id = 10 LIMIT 1), '{"rfp_title": "Digital Marketing Platform", "proposal_length": 2800, "generation_time": 85}', NOW() - INTERVAL '8 days');

-- ========================================
-- VERIFY THE DATA WAS ADDED
-- ========================================

SELECT 'DATA INSERTION COMPLETE!' as status;
SELECT 'RFPs created:' as info, COUNT(*) as count FROM public.rfps;
SELECT 'Proposals created:' as info, COUNT(*) as count FROM public.proposals;  
SELECT 'Usage logs created:' as info, COUNT(*) as count FROM public.usage_logs;

-- Show the data that will fix your dashboard
SELECT 'PIPELINE VALUE:' as metric, SUM(estimated_value) as total_value FROM public.proposals;
SELECT 'WIN RATE:' as metric, 
       ROUND(100.0 * COUNT(CASE WHEN status = 'won' THEN 1 END) / COUNT(*), 1) as win_percentage 
FROM public.proposals;

SELECT '🎉 YOUR DASHBOARD SHOULD NOW SHOW REAL DATA!' as final_status; 