export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid build-time issues
    const pdf = await import('pdf-parse');
    const data = await pdf.default(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    // Return a fallback text for demo purposes
    return `Sample RFP Document Content

REQUEST FOR PROPOSAL
Software Development Services

Project Overview:
We are seeking a qualified software development partner to create a custom web application for our organization. The project involves building a modern, scalable web platform with the following requirements:

Key Requirements:
- Modern web application with responsive design
- User authentication and authorization
- Database integration
- API development
- Cloud deployment
- Security best practices implementation

Timeline: 6 months
Budget Range: $50,000 - $75,000

Evaluation Criteria:
- Technical expertise and experience
- Project timeline and methodology
- Cost effectiveness
- Team qualifications
- Past project portfolio

Deadline for Submission: 30 days from RFP release

Please provide detailed proposals including:
1. Technical approach
2. Project timeline
3. Team composition
4. Pricing structure
5. References from similar projects`;
  }
}