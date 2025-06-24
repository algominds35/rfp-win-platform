import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    // Get user email from query parameter
    const { searchParams } = new URL(request.url);
    let customerId = searchParams.get('email') || searchParams.get('userId');
    
    // If no email provided, use demo fallback
    if (!customerId) {
      customerId = 'demo-user@example.com';
    }
    
    console.log('Analytics API - Fetching REAL data for:', customerId);

    // Get REAL user usage data
    const usage = await AnalyticsService.getUserUsage(customerId);
    
    // Get REAL analytics data from database
    const analytics = await AnalyticsService.getUserAnalytics(customerId);
    
    // Get REAL pipeline data from database
    const pipeline = await AnalyticsService.getRfpPipeline(customerId);

    console.log('Analytics API - Returning REAL data:', {
      usage,
      analytics,
      pipelineCount: pipeline.length
    });

    return NextResponse.json({
      analytics,
      usage,
      pipeline,
      customer: {
        email: customerId,
        plan: usage.planType
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 