import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Creating test data for:', email);

    // Get or create customer
    let { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (customerError && customerError.code === 'PGRST116') {
      // Create new customer
      const { data: newCustomer, error: createError } = await supabaseAdmin
        .from('customers')
        .insert({
          email,
          first_name: 'Test',
          last_name: 'User',
          company: 'Test Company',
          plan_type: 'free',
          analyses_limit: 3,
          analyses_used: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating customer:', createError);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
      }
      
      customer = newCustomer;
    } else if (customerError) {
      console.error('Error fetching customer:', customerError);
      return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
    }

    // Create test RFPs
    const rfpData = [
      {
        customer_id: customer.id,
        title: 'Cloud Infrastructure Migration',
        description: 'Migrate legacy systems to cloud infrastructure',
        requirements: ['AWS/Azure expertise', 'Data migration', '99.9% uptime'],
        evaluation_criteria: ['Technical approach', 'Timeline', 'Cost'],
        budget_range: '$100,000 - $200,000',
        deadline: '2025-03-01',
        compliance_score: 85
      },
      {
        customer_id: customer.id,
        title: 'AI-Powered Analytics Platform',
        description: 'Build machine learning analytics platform',
        requirements: ['ML/AI expertise', 'Real-time processing', 'Scalable architecture'],
        evaluation_criteria: ['Innovation', 'Scalability', 'Team experience'],
        budget_range: '$150,000 - $300,000',
        deadline: '2025-04-15',
        compliance_score: 92
      },
      {
        customer_id: customer.id,
        title: 'Digital Transformation Initiative',
        description: 'Complete digital transformation of business processes',
        requirements: ['Process automation', 'System integration', 'Change management'],
        evaluation_criteria: ['Methodology', 'Experience', 'Support'],
        budget_range: '$200,000 - $500,000',
        deadline: '2025-06-30',
        compliance_score: 78
      }
    ];

    const { data: rfps, error: rfpError } = await supabaseAdmin
      .from('rfps')
      .insert(rfpData)
      .select();

    if (rfpError) {
      console.error('Error creating RFPs:', rfpError);
      return NextResponse.json({ error: 'Failed to create RFPs' }, { status: 500 });
    }

    // Create test proposals
    const proposalData = rfps.map((rfp, index) => ({
      customer_id: customer.id,
      rfp_id: rfp.id,
      title: `Proposal for ${rfp.title}`,
      content: `Comprehensive proposal for ${rfp.title} project...`,
      executive_summary: 'Executive summary of our approach...',
      technical_approach: 'Detailed technical methodology...',
      timeline: `${12 + index * 4} weeks`,
      team_qualifications: 'Our team has extensive experience...',
      win_probability: 70 + index * 10,
      estimated_value: (100000 + index * 50000).toString(),
      status: ['submitted', 'in_progress', 'won'][index % 3] as 'submitted' | 'in_progress' | 'won',
      client_name: ['TechCorp Inc', 'Innovation Labs', 'Global Systems'][index % 3]
    }));

    const { data: proposals, error: proposalError } = await supabaseAdmin
      .from('proposals')
      .insert(proposalData)
      .select();

    if (proposalError) {
      console.error('Error creating proposals:', proposalError);
      return NextResponse.json({ error: 'Failed to create proposals' }, { status: 500 });
    }

    // Create usage logs
    const usageData = [
      {
        customer_id: customer.id,
        action: 'rfp_analysis',
        resource_id: rfps[0].id,
        metadata: { rfp_title: rfps[0].title }
      },
      {
        customer_id: customer.id,
        action: 'proposal_generation',
        resource_id: proposals[0].id,
        metadata: { proposal_title: proposals[0].title }
      },
      {
        customer_id: customer.id,
        action: 'rfp_analysis',
        resource_id: rfps[1].id,
        metadata: { rfp_title: rfps[1].title }
      }
    ];

    const { error: usageError } = await supabaseAdmin
      .from('usage_logs')
      .insert(usageData);

    if (usageError) {
      console.error('Error creating usage logs:', usageError);
    }

    // Update customer usage count
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({ analyses_used: 3 })
      .eq('id', customer.id);

    if (updateError) {
      console.error('Error updating customer usage:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        customer: customer.email,
        rfps: rfps.length,
        proposals: proposals.length,
        usageLogs: usageData.length
      }
    });

  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 