import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, plan } = await request.json();
    
    if (!email || !plan) {
      return NextResponse.json({ error: 'Email and plan required' }, { status: 400 });
    }

    console.log(`🔧 Fixing plan for ${email} to ${plan}`);

    // Plan limits
    const planLimits = {
      free: 3,
      basic: 25,
      pro: 250,
      enterprise: 5000
    };

    const limit = planLimits[plan as keyof typeof planLimits] || 25;

    // Update customer plan
    const { data: updatedCustomer, error } = await supabaseAdmin
      .from('customers')
      .update({
        plan_type: plan,
        analyses_limit: limit,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Error updating plan:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Plan updated successfully:`, updatedCustomer);

    return NextResponse.json({
      success: true,
      message: `Plan updated to ${plan} with ${limit} analyses per month`,
      customer: updatedCustomer
    });

  } catch (error) {
    console.error('Fix plan error:', error);
    return NextResponse.json({ error: 'Failed to fix plan' }, { status: 500 });
  }
} 