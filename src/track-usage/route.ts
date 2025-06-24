import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, action } = await req.json();
    console.log(`Track usage: ${email} - ${action}`);

    if (action === 'check') {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !customer) {
        // Create free account
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert({
            email,
            plan_type: 'free',
            analyses_limit: 2,
            analyses_used: 0,
            subscription_status: 'active'
          })
          .select()
          .single();

        if (insertError) {
          return NextResponse.json({ success: false, error: 'Failed to create account' });
        }

        return NextResponse.json({
          success: true,
          customer: newCustomer,
          remaining: 2
        });
      }

      return NextResponse.json({
        success: true,
        customer,
        remaining: customer.analyses_limit - customer.analyses_used
      });
    }

    if (action === 'use') {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !customer) {
        return NextResponse.json({ success: false, error: 'No account found' });
      }

      if (customer.analyses_used >= customer.analyses_limit) {
        return NextResponse.json({ success: false, error: 'Usage limit reached' });
      }

      const { data: updated, error: updateError } = await supabase
        .from('customers')
        .update({ analyses_used: customer.analyses_used + 1 })
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ success: false, error: 'Failed to update usage' });
      }

      return NextResponse.json({
        success: true,
        customer: updated,
        remaining: updated.analyses_limit - updated.analyses_used
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' });
  } catch (error) {
    console.error('Track usage error:', error);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}