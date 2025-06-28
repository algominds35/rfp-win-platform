import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const demoEmail = 'demo@rfpwin.com';
    
    // Create or update demo user
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .upsert({
        email: demoEmail,
        first_name: 'Demo',
        last_name: 'User',
        company: 'Demo Company',
        plan: 'professional', // Give demo user full access
        usage_count: 0,
        usage_limit: 250,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Demo user creation error:', error);
      return NextResponse.json({ error: 'Failed to create demo user' }, { status: 500 });
    }

    // Create demo company profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('company_profiles')
      .upsert({
        customer_id: customer.id,
        name: 'Demo Tech Solutions',
        capabilities: [
          'Software Development',
          'Cloud Infrastructure',
          'Data Analytics',
          'Cybersecurity',
          'AI/ML Solutions'
        ],
        team_size: 25,
        budget_range: '$100,000 - $500,000',
        contact_info: {
          website: 'www.demotechsolutions.com',
          email: demoEmail,
          phone: '+1 (555) 123-4567'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      user: {
        email: customer.email,
        name: `${customer.first_name} ${customer.last_name}`,
        company: customer.company,
        plan: customer.plan,
        usage: `${customer.usage_count}/${customer.usage_limit}`
      },
      profile: profile || null
    });

  } catch (error) {
    console.error('Demo setup error:', error);
    return NextResponse.json({ error: 'Failed to setup demo' }, { status: 500 });
  }
} 