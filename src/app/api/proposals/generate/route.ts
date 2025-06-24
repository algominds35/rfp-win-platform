import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { AnalyticsService } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const { rfpAnalysis, companyProfile, userId } = await request.json();

    if (!rfpAnalysis || !companyProfile || !userId) {
      return NextResponse.json(
        { error: 'RFP analysis, company profile, and userId are required' },
        { status: 400 }
      );
    }

    // Check usage limits first
    const usageCheck = await AnalyticsService.checkUsageLimit(userId, 'proposal_generation');
    
    if (!usageCheck.allowed) {
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

    // Generate proposal using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert proposal writer specializing in winning RFP responses. 
          Create professional, compelling proposals that directly address client needs and demonstrate clear value.
          Always include specific deliverables, timelines, and pricing strategies.`
        },
        {
          role: "user",
          content: `Generate a comprehensive winning proposal based on:

RFP ANALYSIS:
Title: ${rfpAnalysis.title}
Client: ${rfpAnalysis.client}
Requirements: ${rfpAnalysis.requirements?.join(', ') || 'Not specified'}
Evaluation Criteria: ${rfpAnalysis.evaluationCriteria?.join(', ') || 'Not specified'}
Timeline: ${rfpAnalysis.timeline || 'Not specified'}
Budget: ${rfpAnalysis.budgetRange || 'Not specified'}

COMPANY PROFILE:
Name: ${companyProfile.name}
Team Size: ${companyProfile.teamSize}
Core Capabilities: ${companyProfile.coreCapabilities?.join(', ') || 'Not specified'}
Contact: ${companyProfile.contactEmail}

Create a professional proposal with these sections:
1. Executive Summary (compelling overview)
2. Understanding of Requirements (demonstrate comprehension)
3. Technical Approach (detailed methodology)
4. Project Timeline (realistic milestones)
5. Team Qualifications (relevant experience)
6. Pricing Strategy (competitive and justified)
7. Risk Management (mitigation strategies)
8. Value Proposition (unique benefits)

Format as a complete, professional document ready for submission.`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const proposalContent = completion.choices[0]?.message?.content;
    
    if (!proposalContent) {
      throw new Error('No proposal content generated');
    }

    // Log the successful usage
    await AnalyticsService.logUsage(userId, 'proposal_generation', {
      rfpTitle: rfpAnalysis.title,
      client: rfpAnalysis.client,
      proposalLength: proposalContent.length
    });

    // Get updated usage stats
    const updatedUsage = await AnalyticsService.getUserUsage(userId);

    return NextResponse.json({
      success: true,
      proposal: {
        content: proposalContent,
        title: `Proposal for ${rfpAnalysis.title}`,
        client: rfpAnalysis.client,
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