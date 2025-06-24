import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create free plan subscription
    const result = await AnalyticsService.createSubscription(
      email,
      'free'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Free account created successfully',
      redirectUrl: '/dashboard'
    });

  } catch (error) {
    console.error('Free signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 