import Link from 'next/link';
import { CheckCircle, ArrowRight, Zap, Users, Trophy } from 'lucide-react';

export default function SuccessPage() {
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
          <p className="text-xl text-gray-600 mb-8">
            Welcome to RFP Win Platform! Your subscription is now active.
          </p>

          {/* What's Next */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">🚀 What's Next?</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">1. Setup Your Profile</h3>
                <p className="text-sm text-gray-600">Add your company info and capabilities</p>
              </div>

              {/* Step 2 */}
              <div className="text-center p-6 bg-orange-50 rounded-lg">
                <div className="h-12 w-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">2. Upload Your First RFP</h3>
                <p className="text-sm text-gray-600">Let AI analyze requirements instantly</p>
              </div>

              {/* Step 3 */}
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">3. Generate Proposals</h3>
                <p className="text-sm text-gray-600">Create winning proposals in minutes</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/profile" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              👤 Setup Company Profile
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

          {/* Support Info */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Need Help Getting Started?</h3>
            <p className="text-gray-600 mb-4">
              Check your email for onboarding tips, or contact our support team.
            </p>
            <Link 
              href="/dashboard" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 