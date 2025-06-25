import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, plan } = await request.json();
    
    if (!email || !plan) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and plan are required' 
      }, { status: 400 });
    }

    // Define plan limits
    const planLimits = {
      free: 3,
      basic: 25,
      pro: 250,
      enterprise: 5000
    };

    const analysesLimit = planLimits[plan as keyof typeof planLimits] || 3;

    console.log(`🔧 Manually upgrading ${email} to ${plan} plan with ${analysesLimit} analyses`);

    // Update customer plan
    const { data, error } = await supabaseAdmin
      .from('customers')
      .upsert({
        email: email,
        plan_type: plan,
        analyses_limit: analysesLimit,
        analyses_used: 0,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select();

    if (error) {
      console.error('❌ Error upgrading customer:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    console.log('✅ Customer upgraded successfully:', data);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully upgraded ${email} to ${plan} plan`,
      customer: data[0]
    });

  } catch (error) {
    console.error('❌ Plan upgrade failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 