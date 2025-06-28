# Monthly Usage Reset Automation

## Option 1: Vercel Cron Jobs (Recommended)

Add to your `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/reset-usage",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

This runs on the 1st of every month at midnight UTC.

## Option 2: External Cron Service

Use a service like:
- **Cron-job.org** (free)
- **EasyCron** 
- **GitHub Actions**

Set up to call:
```
POST https://rfp-win-platform-emp09dbss-algo-s-projects.vercel.app/api/reset-usage
```

## Option 3: Manual Reset

Call the API manually each month:
```bash
curl -X POST https://rfp-win-platform-emp09dbss-algo-s-projects.vercel.app/api/reset-usage
```

## Current Status
- ✅ Reset API is built and working
- ⏳ Automation needs to be set up
- 📊 All customers will get their usage reset to 0

## What Happens During Reset
1. All customers' `analyses_used` set to 0
2. `updated_at` timestamp updated
3. Users can immediately start using their monthly allocation
4. No impact on their plan_type or analyses_limit 