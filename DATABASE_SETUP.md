# Database & Usage Tracking Setup Guide

## 🗄️ **Step 1: Supabase Database Setup**

### 1.1 Create Database Schema
1. Go to your Supabase dashboard → SQL Editor
2. Copy and paste the contents of `database-schema.sql`
3. Run the SQL to create all tables, indexes, and functions

### 1.2 Environment Variables
Add these to your `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk (for authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 🔧 **Step 2: Update Your APIs**

### 2.1 Update RFP Upload API
Add usage tracking to `/api/extract/route.ts`:

```typescript
// At the beginning of your extract API
const trackingResponse = await fetch('/api/track-usage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'rfp_upload',
    metadata: { fileName: file.name }
  })
});

if (!trackingResponse.ok) {
  const error = await trackingResponse.json();
  return NextResponse.json({ 
    error: error.error || 'Usage limit exceeded' 
  }, { status: 429 });
}
```

### 2.2 Update Proposal Generation API
Add usage tracking to `/api/proposals/generate/route.ts`:

```typescript
// At the beginning of your proposal generation API
const trackingResponse = await fetch('/api/track-usage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'proposal_generation',
    metadata: { rfpTitle: rfpData.title }
  })
});

if (!trackingResponse.ok) {
  const error = await trackingResponse.json();
  return NextResponse.json({ 
    error: error.error || 'Usage limit exceeded' 
  }, { status: 429 });
}
```

## 📊 **Step 3: Real Data Storage**

### 3.1 Store RFP Data
When users upload RFPs, save to database:

```typescript
// In your extract API, after successful analysis
const { data: rfp, error } = await supabaseAdmin
  .from('rfps')
  .insert({
    user_id: dbUserId,
    title: analysisResult.title,
    description: analysisResult.description,
    requirements: analysisResult.requirements,
    evaluation_criteria: analysisResult.evaluation_criteria,
    budget_range: analysisResult.budget_range,
    deadline: analysisResult.deadline,
    file_name: file.name,
    file_size: file.size
  })
  .select()
  .single();
```

### 3.2 Store Proposal Data
When users generate proposals, save to database:

```typescript
// In your proposal generation API, after successful generation
const { data: proposal, error } = await supabaseAdmin
  .from('proposals')
  .insert({
    user_id: dbUserId,
    rfp_id: rfpId, // Link to the RFP
    title: proposalTitle,
    content: generatedProposal,
    executive_summary: executiveSummary,
    estimated_value: estimatedValue,
    win_probability: winProbability,
    client_name: clientName,
    status: 'draft'
  })
  .select()
  .single();
```

## 🎯 **Step 4: Usage Limits by Plan**

### Current Plan Limits:
- **Basic ($49/month)**: 10 RFPs, 10 Proposals
- **Pro ($299/month)**: 100 RFPs, 100 Proposals  
- **Enterprise ($799/month)**: Unlimited (-1 in database)

### 4.1 Enforce Limits in UI
Add usage checks before allowing actions:

```typescript
// Before showing upload button
const usageResponse = await fetch('/api/track-usage');
const { usage } = await usageResponse.json();

if (usage.remaining.rfps <= 0) {
  // Show upgrade prompt instead of upload button
  return <UpgradePrompt />;
}
```

## 🔄 **Step 5: Stripe Integration**

### 5.1 Update Webhook Handler
The webhook in `/api/billing/webhook/route.ts` already creates subscriptions.
Make sure it's working by testing with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

### 5.2 Create Subscription After Payment
When users pay, create their subscription:

```typescript
// This happens automatically via webhook
// But you can also manually create for testing:
await AnalyticsService.createSubscription(
  userId,
  'pro', // or 'basic', 'enterprise'
  stripeCustomerId,
  stripeSubscriptionId
);
```

## 📈 **Step 6: Real Analytics**

Your dashboard will now show:
- **Real RFP counts** from database
- **Actual win rates** based on proposal status
- **True pipeline value** from proposal estimates
- **Real usage tracking** with limits
- **Actual response times** calculated from timestamps

## 🧪 **Step 7: Testing**

### 7.1 Test Usage Limits
1. Set a low limit (e.g., 2 RFPs) for testing
2. Upload RFPs until limit is reached
3. Verify you get "Usage limit exceeded" error
4. Upgrade plan and verify limits increase

### 7.2 Test Analytics
1. Upload several RFPs
2. Generate proposals with different statuses
3. Check dashboard shows real data
4. Verify pipeline table shows actual proposals

## 🚀 **Step 8: Production Deployment**

### 8.1 Environment Setup
- Set up production Supabase project
- Configure production Stripe account
- Set up production Clerk instance
- Update all environment variables

### 8.2 Database Migration
- Run the schema SQL on production database
- Set up database backups
- Configure Row Level Security policies

## 🔧 **Step 9: Monitoring**

Add monitoring for:
- API response times
- Database query performance  
- Usage tracking accuracy
- Error rates
- Customer churn/upgrades

## 💡 **Quick Start (MVP)**

If you want to test this immediately:

1. **Run the database schema** in Supabase
2. **Set environment variables**
3. **Test the new dashboard** - it will show mock data with real API structure
4. **Gradually replace mock data** as you add real usage tracking

The system is designed to gracefully fall back to mock data when the database isn't fully set up, so you can deploy incrementally!

## 🎯 **Business Impact**

With this real tracking system, you'll have:
- **Accurate usage billing** 
- **Real customer analytics**
- **Proper plan enforcement**
- **Data-driven insights** for product improvements
- **Scalable architecture** for growth

This transforms your MVP from a demo into a real SaaS business with proper usage tracking and analytics! 