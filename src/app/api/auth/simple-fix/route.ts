import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, company } = await request.json();

    console.log('Simple signup attempt:', { email, firstName, lastName, company });

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('customers')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Try to insert with minimal required fields first
    const { data: newUser, error } = await supabaseAdmin
      .from('customers')
      .insert({
        email: email,
        plan_type: 'free',
        analyses_limit: 3,
        analyses_used: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error 
      }, { status: 500 });
    }

    console.log('User created successfully:', newUser);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        email: newUser.email,
        id: newUser.id
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 