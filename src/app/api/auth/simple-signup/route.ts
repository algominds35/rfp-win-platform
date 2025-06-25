import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, company, plan } = await request.json();

    // Validate required fields
    if (!email || !firstName || !lastName || !company) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Set plan limits
    const planLimits = {
      free: 3,
      basic: 25,
      pro: 250,
      enterprise: 5000
    };

    const analysesLimit = planLimits[plan as keyof typeof planLimits] || 3;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('customers')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create customer record directly (no Supabase Auth)
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        email: email,
        first_name: firstName,
        last_name: lastName,
        company: company,
        plan_type: plan,
        analyses_limit: analysesLimit,
        analyses_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (customerError) {
      console.error('Customer creation error:', customerError);
      return NextResponse.json(
        { success: false, error: 'Failed to create customer record: ' + customerError.message },
        { status: 500 }
      );
    }

    // Log the signup event
    console.log(`✅ Simple ${plan} signup: ${email} - ${firstName} ${lastName} (${company})`);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        company: customer.company,
        plan: customer.plan_type,
        analysesLimit: customer.analyses_limit,
        analysesUsed: customer.analyses_used
      }
    });

  } catch (error) {
    console.error('Simple signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 