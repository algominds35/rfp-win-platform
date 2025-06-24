#!/bin/bash

# RFP Win Platform - Deployment Script
echo "🚀 Deploying RFP Win Platform to Production..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project first
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🔧 Don't forget to:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Update Stripe payment links to live mode"
echo "3. Set up Supabase production database"
echo "4. Test payment flow with real card"
echo ""
echo "🎯 Ready to get your first 100 customers!" 