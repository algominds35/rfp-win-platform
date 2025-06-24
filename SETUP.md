# RFP Win Platform - Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Open Your Browser**
   Navigate to `http://localhost:3000`

## MVP Features Built

✅ **RFP Upload & Analysis**
- PDF upload with drag & drop
- AI extracts key requirements and evaluation criteria
- Identifies deadlines, budget, and risk factors
- Strategic recommendations for winning

✅ **Company Profile Setup**
- One-time setup of capabilities and past projects
- Team information and certifications
- Persistent storage (in-memory for MVP)

✅ **AI Proposal Generator**
- Combines RFP analysis with company profile
- Generates customized proposals with executive summary
- Compliance scoring and win probability calculation
- Professional formatting with copy/export features

✅ **Smart Dashboard**
- Quick stats and recent RFPs
- Easy navigation between features
- Clean, professional UI

## How to Use

1. **Upload an RFP**: Go to Dashboard → Upload RFP → Drop your PDF
2. **Set up Profile**: Dashboard → Setup Profile → Add your company info
3. **Generate Proposal**: After upload → Generate Winning Proposal
4. **Review & Export**: Copy or download your AI-generated proposal

## Core Tech Stack

- **Frontend**: Next.js 15 + Tailwind CSS
- **AI**: OpenAI GPT-4 for analysis and generation
- **PDF Processing**: pdf-parse library
- **Storage**: In-memory (MVP) - ready for database integration
- **UI**: Lucide React icons, responsive design

## API Endpoints

- `POST /api/extract` - RFP PDF upload and analysis
- `POST /api/proposals/generate` - Generate winning proposals
- `GET/POST /api/company` - Company profile management

## Next Steps for Production

1. **Database Integration**: Replace in-memory storage with PostgreSQL/Supabase
2. **Authentication**: Add user accounts with Clerk or NextAuth
3. **File Storage**: Use AWS S3 or similar for PDF storage
4. **Enhanced AI**: Add fine-tuning for industry-specific proposals
5. **Collaboration**: Team features and proposal sharing
6. **Analytics**: Win rate tracking and proposal performance metrics

## Revenue Model (As Planned)

- **Basic**: $99/month (10 RFP analyses)
- **Pro**: $199/month (100 RFPs + team features)  
- **Enterprise**: $2000/month (unlimited + custom training)

The core workflow is complete and ready for user testing! 