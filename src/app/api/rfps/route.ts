import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get customer ID from email
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', userId)
      .single();

    if (!customer) {
      return NextResponse.json({
        success: true,
        rfps: []
      });
    }

    // Fetch user's RFPs
    const { data: rfps, error } = await supabaseAdmin
      .from('rfps')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RFPs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch RFPs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rfps: rfps || []
    });

  } catch (error) {
    console.error('Error in RFPs API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RFPs' },
      { status: 500 }
    );
  }
} 