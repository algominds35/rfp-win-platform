import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for MVP - replace with database later
let companyProfiles: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json();
    
    // Validate required fields
    if (!profile.name || !profile.capabilities) {
      return NextResponse.json({ error: 'Company name and capabilities are required' }, { status: 400 });
    }

    // Generate simple ID (use proper auth user ID in production)
    const profileId = profile.id || 'default-company';
    
    // Save profile
    companyProfiles[profileId] = {
      ...profile,
      id: profileId,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      profile: companyProfiles[profileId]
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
    
    const profile = companyProfiles[profileId];
    
    if (!profile) {
      // Return default empty profile structure
      return NextResponse.json({
        profile: {
          id: profileId,
          name: '',
          capabilities: [],
          past_projects: [],
          team_size: 0,
          certifications: [],
          contact_info: {},
          created_at: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('Company profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company profile' },
      { status: 500 }
    );
  }
} 