import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Simple login attempt:', { email });

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists in customers table
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    let userRecord = customer;

    // If user doesn't exist, create them automatically
    if (error || !customer) {
      console.log('User not found, creating new account for:', email);
      
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('customers')
        .insert({
          email: email,
          first_name: email.split('@')[0], // Use email prefix as first name
          last_name: 'User',
          company: 'My Company',
          plan_type: 'free',
          analyses_limit: 3,
          analyses_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user:', createError);
        return NextResponse.json(
          { error: 'Failed to create account' },
          { status: 500 }
        );
      }

      userRecord = newUser;
      console.log('✅ Auto-created user account:', email);
    }

    console.log('User login successful:', userRecord.email);

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        plan: userRecord.plan_type,
        analysesLimit: userRecord.analyses_limit,
        analysesUsed: userRecord.analyses_used
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 