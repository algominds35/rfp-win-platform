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

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    console.log('User found:', customer.email);

    // For demo purposes, accept any password
    // In production, you'd verify password hash here

    return NextResponse.json({
      success: true,
      user: {
        id: customer.id,
        email: customer.email,
        plan: customer.plan_type,
        analysesLimit: customer.analyses_limit,
        analysesUsed: customer.analyses_used
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