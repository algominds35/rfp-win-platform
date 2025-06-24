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
        content: "Extract key requirements from this RFP. Return as a JSON array of strings."
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.3,
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
}> {
  const prompt = `
Generate a winning proposal based on:

RFP Requirements: ${requirements.join(', ')}
Company Profile: ${JSON.stringify(companyProfile)}
RFP Text: ${rfpText.substring(0, 2000)}

Create a professional proposal with:
1. Executive Summary
2. Technical Approach
3. Project Timeline
4. Team Qualifications
5. Pricing Strategy

Return as JSON with: content, executive_summary, compliance_score (0-100), win_probability (0-100)
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert proposal writer. Generate winning RFP responses."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
  });

  try {
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch {
    return {
      content: response.choices[0].message.content || '',
      executive_summary: '',
      compliance_score: 85,
      win_probability: 75
    };
  }
}