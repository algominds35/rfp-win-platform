import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json();
    
    // Validate required fields
    if (!profile.name || !profile.capabilities) {
      return NextResponse.json({ error: 'Company name and capabilities are required' }, { status: 400 });
    }

    // Get user email from profile ID or use authenticated user
    const userEmail = profile.id?.replace('company-', '') || 'demo-user@example.com';
    
    // Get customer ID
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (!customer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Save or update company profile in database
    const { data: savedProfile, error } = await supabaseAdmin
      .from('company_profiles')
      .upsert({
        customer_id: customer.id,
        name: profile.name,
        capabilities: profile.capabilities,
        team_size: profile.team_size || 0,
        budget_range: profile.budget_range || '',
        contact_info: profile.contact_info || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database save error:', error);
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: `company-${userEmail}`,
        name: savedProfile.name,
        capabilities: savedProfile.capabilities,
        team_size: savedProfile.team_size,
        budget_range: savedProfile.budget_range,
        contact_info: savedProfile.contact_info,
        updated_at: savedProfile.updated_at
      }
    });

  } catch (error) {
    console.error('Company profile save error:', error);
    return NextResponse.json(
      { error: 'Failed to save company profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('id') || 'default-company';
    
    // Extract user email from profile ID
    const userEmail = profileId.replace('company-', '') || 'demo-user@example.com';
    
    // Get customer ID
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (!customer) {
      // Return EMPTY profile for new users - no fake data
      return NextResponse.json({
        profile: null
      });
    }

    // Get company profile from database
    const { data: profile } = await supabaseAdmin
      .from('company_profiles')
      .select('*')
      .eq('customer_id', customer.id)
      .single();

    if (!profile) {
      // Return EMPTY profile - user needs to create one
      return NextResponse.json({
        profile: null
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profileId,
        name: profile.name,
        capabilities: profile.capabilities,
        team_size: profile.team_size,
        budget_range: profile.budget_range,
        contact_info: profile.contact_info,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    });

  } catch (error) {
    console.error('Company profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company profile' },
      { status: 500 }
    );
  }
} 