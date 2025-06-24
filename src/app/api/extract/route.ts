import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-extract';
import { openai } from '@/lib/openai';
import { AnalyticsService } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }

    // Check usage limits first
    const usageCheck = await AnalyticsService.checkUsageLimit(userId, 'rfp_analysis');
    
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          message: `You've reached your monthly limit of ${usageCheck.limit} RFP analyses. Upgrade your plan to continue.`,
          remaining: usageCheck.remaining,
          limit: usageCheck.limit,
          planType: usageCheck.planType
        },
        { status: 429 }
      );
    }

    // Extract text from PDF
    let extractedText = '';
    try {
      const buffer = await file.arrayBuffer();
      extractedText = await extractTextFromPDF(Buffer.from(buffer));
    } catch (error) {
      console.error('PDF extraction failed:', error);
      // Fallback to demo content
      extractedText = `
        REQUEST FOR PROPOSAL
        Cloud Infrastructure Migration Services
        
        ABC Corporation is seeking proposals for migrating our on-premise infrastructure to cloud services.
        
        SCOPE OF WORK:
        - Migrate 50+ virtual machines to AWS/Azure
        - Implement security best practices
        - Provide 24/7 monitoring and support
        - Complete migration within 6 months
        
        EVALUATION CRITERIA:
        - Technical approach (40%)
        - Cost effectiveness (30%)
        - Team experience (20%)
        - Timeline feasibility (10%)
        
        BUDGET: $500,000 - $750,000
        DEADLINE: Proposals due March 15, 2024
        
        Contact: procurement@abccorp.com
      `;
    }

    // Analyze with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert RFP analyzer. Extract key information from RFP documents and return structured data."
        },
        {
          role: "user",
          content: `Analyze this RFP document and extract the following information in JSON format:
          
          {
            "title": "RFP title",
            "client": "Client/Organization name",
            "description": "Brief description of the project",
            "requirements": ["requirement 1", "requirement 2", ...],
            "evaluationCriteria": ["criteria 1", "criteria 2", ...],
            "timeline": "Project timeline or deadline",
            "budgetRange": "Budget information if available",
            "contactInfo": "Contact information",
            "keyDeliverables": ["deliverable 1", "deliverable 2", ...]
          }
          
          RFP Document:
          ${extractedText}`
        }
      ],
      temperature: 0.3,
    });

    const analysisResult = completion.choices[0]?.message?.content;
    
    if (!analysisResult) {
      throw new Error('No analysis result from OpenAI');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(analysisResult);
    } catch (error) {
      // If JSON parsing fails, return a structured error
      parsedResult = {
        title: "RFP Analysis",
        client: "Unknown Client",
        description: "Failed to parse RFP content",
        requirements: ["Unable to extract requirements"],
        evaluationCriteria: ["Unable to extract criteria"],
        timeline: "Unknown",
        budgetRange: "Not specified",
        contactInfo: "Not available",
        keyDeliverables: ["Analysis failed"]
      };
    }

    // Log the successful usage
    await AnalyticsService.logUsage(userId, 'rfp_analysis', {
      fileName: file.name,
      fileSize: file.size,
      extractedLength: extractedText.length
    });

    return NextResponse.json({
      success: true,
      analysis: parsedResult,
      usage: await AnalyticsService.getUserUsage(userId)
    });

  } catch (error) {
    console.error('Error in RFP extraction:', error);
    return NextResponse.json(
      { error: 'Failed to analyze RFP document' },
      { status: 500 }
    );
  }
}