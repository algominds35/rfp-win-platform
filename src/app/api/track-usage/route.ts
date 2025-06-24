import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/analytics';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, action, metadata } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has remaining usage
    const usageCheck = await AnalyticsService.checkUsageLimit(userId, action);
    
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          remaining: usageCheck.remaining,
          limit: usageCheck.limit,
          planType: usageCheck.planType
        },
        { status: 429 }
      );
    }

    // Log the usage
    const logged = await AnalyticsService.logUsage(userId, action, metadata);
    
    if (!logged) {
      return NextResponse.json(
        { error: 'Failed to log usage' },
        { status: 500 }
      );
    }

    // Get updated usage stats
    const updatedUsage = await AnalyticsService.getUserUsage(userId);

    return NextResponse.json({
      success: true,
      usage: updatedUsage
    });

  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current usage
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ 
        usage: {
          rfpsUsed: 0,
          rfpLimit: 0,
          proposalsUsed: 0,
          proposalLimit: 0,
          planType: 'none',
          remaining: { rfps: 0, proposals: 0 }
        }
      });
    }

    const usage = await AnalyticsService.getUserUsage(user.id);
    return NextResponse.json({ usage });

  } catch (error) {
    console.error('Error getting usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 