import { NextRequest, NextResponse } from 'next/server';
import { generateProposal, analyzeRFPCompetitiveness } from '@/lib/openai';
import { AnalyticsService } from '@/lib/analytics';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { rfpAnalysis, companyProfile, userId } = await request.json();

    if (!rfpAnalysis || !companyProfile || !userId) {
      return NextResponse.json(
        { error: 'RFP analysis, company profile, and userId are required' },
        { status: 400 }
      );
    }

    // Check usage limits first - STRICT ENFORCEMENT
    const usageCheck = await AnalyticsService.checkUsageLimit(userId, 'proposal_generation');
    
    console.log('🔍 Proposal usage check for:', userId, usageCheck);
    
    if (!usageCheck.allowed) {
      console.log('🚫 BLOCKING: Proposal usage limit exceeded', usageCheck);
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          message: `You've reached your monthly limit of ${usageCheck.limit} proposal generations. Upgrade your plan to continue.`,
          remaining: usageCheck.remaining,
          limit: usageCheck.limit,
          planType: usageCheck.planType
        },
        { status: 429 }
      );
    }
    
    console.log('✅ Proposal usage allowed, proceeding');

    // Parse the RFP analysis if it's a string (from the analysis output)
    let parsedAnalysis = rfpAnalysis;
    if (typeof rfpAnalysis === 'string') {
      // Extract key information from the analysis text
      const analysisText = rfpAnalysis;
      
      // Extract requirements
      const requirementsMatch = analysisText.match(/🎯 Key Requirements Identified\n([\s\S]*?)⚖️/);
      const requirements = requirementsMatch ? requirementsMatch[1].split('•').filter(r => r.trim()).map(r => r.trim()) : [];
      
      // Extract evaluation criteria
      const criteriaMatch = analysisText.match(/⚖️ Evaluation Criteria & Weights\n([\s\S]*?)🤖/);
      const evaluationCriteria = criteriaMatch ? criteriaMatch[1].split('\n').filter(c => c.includes('%')).map(c => c.trim()) : [];
      
      // Extract timeline and budget
      const timelineMatch = analysisText.match(/📅 Timeline: ([^|]*)/);
      const budgetMatch = analysisText.match(/💰 Budget: ([^\n]*)/);
      
      // Extract strategy recommendations
      const strategyMatch = analysisText.match(/🤖 AI Strategy Recommendations\n([\s\S]*?)⚠️/);
      const strategy = strategyMatch ? strategyMatch[1] : '';
      
      // Extract risk factors
      const riskMatch = analysisText.match(/⚠️ Risk Factors\n([\s\S]*?)$/);
      const risks = riskMatch ? riskMatch[1] : '';
      
      parsedAnalysis = {
        title: "Web Application Development Project", // Default from analysis
        client: "Prospective Client",
        requirements,
        evaluationCriteria,
        timeline: timelineMatch ? timelineMatch[1].trim() : "6 months",
        budgetRange: budgetMatch ? budgetMatch[1].trim() : "$50,000 - $75,000",
        strategy,
        risks,
        rawAnalysis: analysisText
      };
    }

    // Generate enterprise-grade proposal using enhanced OpenAI function
    const proposalResult = await generateProposal(
      parsedAnalysis.rawAnalysis || '',
      parsedAnalysis.requirements || [],
      companyProfile
    );

    const proposalContent = proposalResult.content;
    
    if (!proposalContent) {
      throw new Error('No proposal content generated');
    }

    // CRITICAL: Save proposal data to database with proper structure
    try {
      console.log('💾 Saving proposal to database...');
      
      // Save the proposal to database using email as customer_id
      const { data: savedProposal, error: saveError } = await supabaseAdmin
        .from('proposals')
        .insert({
          customer_id: userId, // Use email as customer_id
          title: `Proposal: ${parsedAnalysis.title || 'Web Application Development'}`,
          content: proposalContent,
          client_name: parsedAnalysis.client || 'Prospective Client',
          status: 'draft',
          estimated_value: parsedAnalysis.budgetRange || '$50,000 - $75,000',
          win_probability: proposalResult.win_probability || 85,
          timeline: parsedAnalysis.timeline || '6 months',
          requirements: parsedAnalysis.requirements || [],
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        console.error('❌ Failed to save proposal:', saveError);
      } else {
        console.log('✅ Proposal saved successfully:', savedProposal?.id);
      }
    } catch (saveError) {
      console.error('❌ Database save error:', saveError);
    }

    // Log the successful usage - CRITICAL FOR TRACKING
    try {
      await AnalyticsService.logUsage(userId, 'proposal_generation', {
        rfpTitle: parsedAnalysis.title || 'Web Application Development',
        client: parsedAnalysis.client || 'Prospective Client',
        proposalLength: proposalContent.length,
        budget: parsedAnalysis.budgetRange,
        timeline: parsedAnalysis.timeline
      });
      console.log('✅ Usage logged successfully');
    } catch (usageError) {
      console.error('❌ CRITICAL: Failed to log usage:', usageError);
    }

    // Get updated usage stats
    const updatedUsage = await AnalyticsService.getUserUsage(userId);

    return NextResponse.json({
      success: true,
      proposal: {
        content: proposalContent,
        title: `Proposal: ${parsedAnalysis.title || 'Web Application Development'}`,
        client: parsedAnalysis.client || 'Prospective Client',
        budget: parsedAnalysis.budgetRange,
        timeline: parsedAnalysis.timeline,
        executive_summary: proposalResult.executive_summary,
        compliance_score: proposalResult.compliance_score,
        win_probability: proposalResult.win_probability,
        key_differentiators: proposalResult.key_differentiators,
        risk_factors: proposalResult.risk_factors,
        compliance_matrix: proposalResult.compliance_matrix,
        generatedAt: new Date().toISOString()
      },
      usage: updatedUsage
    });

  } catch (error) {
    console.error('Error generating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to generate proposal' },
      { status: 500 }
    );
  }
} 