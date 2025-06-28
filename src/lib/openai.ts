import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Export the openai client for use in other modules
export { openai };

export async function extractRFPRequirements(text: string): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert RFP analyst with 15+ years of experience in government and commercial procurement. 

Extract and categorize requirements with the following structure:
- MANDATORY requirements (must-have)  
- TECHNICAL requirements (specifications, standards)
- PERFORMANCE requirements (metrics, SLAs)
- COMPLIANCE requirements (certifications, regulations)
- EVALUATION criteria (scoring factors)
- TIMELINE requirements (milestones, deadlines)
- BUDGET constraints (cost limitations)

Return as a detailed JSON array with categorized requirements.`
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.2,
  });

  try {
    return JSON.parse(response.choices[0].message.content || '[]');
  } catch {
    return response.choices[0].message.content?.split('\n').filter(Boolean) || [];
  }
}

export async function generateProposal(
  rfpText: string,
  requirements: string[],
  companyProfile: any,
  template?: any
): Promise<{
  content: string;
  executive_summary: string;
  compliance_score: number;
  win_probability: number;
  key_differentiators: string[];
  risk_factors: string[];
  compliance_matrix: Record<string, any>;
}> {
  const prompt = `
You are a world-class proposal writer who has won over $2 billion in contracts for Fortune 500 companies. Your proposals have a 78% win rate in competitive procurements.

CRITICAL ANALYSIS REQUIRED:
RFP Requirements: ${requirements.join('\n• ')}
Company Profile: ${JSON.stringify(companyProfile)}
RFP Full Text: ${rfpText.substring(0, 4000)}

⚠️ BUDGET REQUIREMENTS: The client has specified their budget range. This is CRITICAL - you MUST use their exact budget in your pricing strategy and justify the value within this range.

MANDATORY PROPOSAL STANDARDS:
1. Address EVERY requirement with specific solutions
2. Include concrete examples and case studies
3. Provide detailed technical methodologies
4. Show measurable value propositions with ROI calculations
5. Include risk mitigation strategies for identified risks
6. Create compliance matrix showing requirement-to-response mapping
7. Use persuasive language that differentiates from competitors
8. Include specific team member qualifications and roles
9. Provide detailed project timeline with milestones
10. Show understanding of client's business challenges

PROPOSAL STRUCTURE (Enterprise-Grade):
1. EXECUTIVE SUMMARY (compelling overview addressing client pain points)
2. UNDERSTANDING & APPROACH (demonstrate deep comprehension)
3. TECHNICAL SOLUTION (detailed methodology with specifics)
4. PROJECT MANAGEMENT (timeline, milestones, deliverables)
5. TEAM QUALIFICATIONS (specific experience, certifications)
6. PAST PERFORMANCE (relevant case studies with metrics)
7. PRICING STRATEGY (CRITICAL: use client's exact budget range with detailed value justification)
8. RISK MANAGEMENT (identified risks with mitigation plans)
9. VALUE PROPOSITION (unique benefits, competitive advantages)
10. COMPLIANCE MATRIX (requirement-by-requirement response)

QUALITY STANDARDS:
- NO generic language or templates
- NO placeholder text
- Include specific dollar amounts, percentages, timeframes
- Use client's exact terminology and requirements
- Show deep industry knowledge
- Provide actionable solutions, not concepts
- Include measurable outcomes and success metrics

Return as JSON with enhanced fields: content, executive_summary, compliance_score (0-100), win_probability (0-100), key_differentiators (array), risk_factors (array), compliance_matrix (object)
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are the #1 proposal writer in North America with expertise in:
- Government contracting (Federal, State, Local)
- Commercial procurement processes  
- Technical proposal writing
- Compliance and regulatory requirements
- Competitive intelligence and positioning
- Value-based pricing strategies
- Risk assessment and mitigation

Your proposals consistently score 90+ points and win against established incumbents. You understand procurement psychology and write proposals that procurement officers actually want to read and approve.

CRITICAL: Generate proposals that sound like they come from established, successful companies with proven track records. No generic content allowed.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.6,
    max_tokens: 4000
  });

  try {
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      content: result.content || '',
      executive_summary: result.executive_summary || '',
      compliance_score: result.compliance_score || 85,
      win_probability: result.win_probability || 75,
      key_differentiators: result.key_differentiators || [],
      risk_factors: result.risk_factors || [],
      compliance_matrix: result.compliance_matrix || {}
    };
  } catch {
    return {
      content: response.choices[0].message.content || '',
      executive_summary: '',
      compliance_score: 85,
      win_probability: 75,
      key_differentiators: [],
      risk_factors: [],
      compliance_matrix: {}
    };
  }
}

// New function for enhanced RFP analysis
export async function analyzeRFPCompetitiveness(
  rfpText: string,
  requirements: string[],
  companyProfile: any
): Promise<{
  competitive_assessment: string;
  win_probability: number;
  key_challenges: string[];
  recommended_strategy: string;
  differentiators: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system", 
        content: "You are a strategic bid consultant who analyzes RFP competitiveness and develops winning strategies. Provide actionable insights for competitive positioning."
      },
      {
        role: "user",
        content: `Analyze this RFP for competitive positioning:

RFP: ${rfpText.substring(0, 3000)}
Requirements: ${requirements.join('\n• ')}
Company: ${JSON.stringify(companyProfile)}

Provide strategic analysis including competitive assessment, win probability, key challenges, recommended strategy, and potential differentiators.`
      }
    ],
    temperature: 0.4,
  });

  try {
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch {
    return {
      competitive_assessment: response.choices[0].message.content || '',
      win_probability: 65,
      key_challenges: [],
      recommended_strategy: '',
      differentiators: []
    };
  }
}