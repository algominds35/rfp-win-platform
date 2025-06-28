import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create a real user account in the database
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .upsert({
        email: email,
        first_name: 'Test',
        last_name: 'User',
        company: 'Test Company',
        plan: 'free',
        usage_count: 0,
        usage_limit: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        email: customer.email,
        plan: customer.plan,
        usage: `${customer.usage_count}/${customer.usage_limit}`
      }
    });

  } catch (error) {
    console.error('Error in create-test-user API:', error);
    return NextResponse.json({ error: 'Failed to create test user' }, { status: 500 });
  }
} 