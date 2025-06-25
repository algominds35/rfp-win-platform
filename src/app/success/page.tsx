'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Zap, Users, Trophy } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto-redirect to dashboard after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use setTimeout to avoid the React setState during render error
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded"></div>
              <span className="ml-2 text-xl font-bold text-gray-900">RFP Win Platform</span>
            </div>
          </div>
        </div>
      </header>

      {/* Success Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Welcome to RFP Win Platform! Your subscription is now active.
          </p>
          
          {/* Auto-redirect Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800">
              🚀 Redirecting to your dashboard in <span className="font-bold">{countdown}</span> seconds...
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Your upgraded plan limits and analytics will be visible there!
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">🚀 What's Next?</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">1. Check Your Plan</h3>
                <p className="text-sm text-gray-600">View your upgraded limits in the dashboard</p>
              </div>

              {/* Step 2 */}
              <div className="text-center p-6 bg-orange-50 rounded-lg">
                <div className="h-12 w-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">2. Upload RFPs</h3>
                <p className="text-sm text-gray-600">Start analyzing RFPs with your new limits</p>
              </div>

              {/* Step 3 */}
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">3. Generate Proposals</h3>
                <p className="text-sm text-gray-600">Create winning proposals with AI</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              📊 Go to Dashboard Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <Link 
              href="/upload" 
              className="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center"
            >
              📄 Upload First RFP
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Plan Upgrade Info */}
          <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h3 className="font-semibold mb-2 text-green-800">✅ Payment Processed Successfully</h3>
            <p className="text-green-700 mb-2">
              Your plan upgrade is being processed. You should see your new limits in the dashboard within 1-2 minutes.
            </p>
            <p className="text-sm text-green-600">
              If you don't see the upgrade immediately, refresh the dashboard page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 