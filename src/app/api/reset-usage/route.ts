import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log('🔄 Starting monthly usage reset...');

    // Reset analyses_used to 0 for all customers
    const { data, error } = await supabaseAdmin
      .from('customers')
      .update({ 
        analyses_used: 0,
        updated_at: new Date().toISOString()
      })
      .neq('id', 0); // Update all customers

    if (error) {
      console.error('❌ Error resetting usage:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    console.log('✅ Monthly usage reset completed for all customers');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Monthly usage reset completed',
      customersUpdated: data?.length || 0
    });

  } catch (error) {
    console.error('❌ Monthly reset failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET endpoint to check when last reset happened
export async function GET() {
  try {
    // Get the most recent customer update to see when last reset occurred
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const lastReset = data?.[0]?.updated_at || 'Never';
    
    return NextResponse.json({ 
      lastReset,
      nextReset: 'Manual trigger required',
      message: 'Usage reset status'
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 