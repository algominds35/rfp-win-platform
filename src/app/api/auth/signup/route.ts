import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, company, plan } = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !company) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
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
    const { data: existingUser } = await supabase
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

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company: company,
        plan: plan
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    // Create customer record in our customers table
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        id: authUser.user.id,
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
      
      // Clean up auth user if customer creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      
      return NextResponse.json(
        { success: false, error: 'Failed to create customer record' },
        { status: 500 }
      );
    }

    // Log the signup event
    console.log(`New ${plan} signup: ${email} - ${firstName} ${lastName} (${company})`);

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
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 