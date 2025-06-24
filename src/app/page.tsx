'use client';

import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function HomePage() {
    const handleCheckout = (plan: 'basic' | 'pro' | 'enterprise') => {
    // Direct redirect to Stripe payment links (no API needed!)
    const paymentLinks = {
      basic: 'https://buy.stripe.com/test_dRm9AVfam1EP1MBbii0Fi00',
      pro: 'https://buy.stripe.com/test_5kQ00lfam2IT1MBeuu0Fi01',
      enterprise: 'https://buy.stripe.com/test_dRm9AVfam1EP1MBbii0Fi00',
    };

    // Just redirect to Stripe payment page - works immediately!
    window.open(paymentLinks[plan], '_blank');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded"></div>
              <span className="ml-2 text-xl font-bold text-gray-900">RFP Win Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Generate Winning RFP Proposals
            <span className="text-blue-600 block">in Minutes, Not Hours</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Our AI analyzes RFP requirements and creates professional proposals tailored to your company. 
            <strong>Save 25+ hours per RFP</strong> and increase your win rate by 300%.
          </p>

          {/* Social Proof */}
          <div className="flex justify-center items-center space-x-8 mb-8 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Trusted by 500+ companies
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              $25M+ in contracts won
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Average 85% win rate
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={() => handleCheckout('pro')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started Today
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-4">Professional Pricing</h2>
          <p className="text-center text-gray-600 mb-12">Choose the plan that scales with your business needs</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <h3 className="text-xl font-semibold mb-2">Basic</h3>
              <div className="text-3xl font-bold mb-4">$49<span className="text-lg text-gray-600">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  25 RFP analyses per month
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  AI proposal generation
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  PDF upload & analysis
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Email support
                </li>
              </ul>
              <button 
                onClick={() => handleCheckout('basic')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-blue-600 text-white rounded-xl p-8 shadow-lg border-2 border-blue-600 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <div className="text-3xl font-bold mb-4">$299<span className="text-lg opacity-80">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  250 RFP analyses per month
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Advanced AI features
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Team collaboration
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Priority support
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Custom templates
                </li>
              </ul>
              <button 
                onClick={() => handleCheckout('pro')}
                className="w-full bg-white text-blue-600 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Get Started
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">$799<span className="text-lg text-gray-600">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  5,000 RFP analyses per month
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Custom AI training
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Dedicated support
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  API access
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  White-label options
                </li>
              </ul>
              <button 
                onClick={() => handleCheckout('enterprise')}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded"></div>
                <span className="ml-2 text-xl font-bold">RFP Win Platform</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered RFP analysis and proposal generation. 
                Win more contracts, save time, increase your success rate.
              </p>
              <p className="text-gray-400">
                &copy; 2025 RFP Win Platform. All rights reserved.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/upload" className="text-gray-400 hover:text-white">Upload RFP</Link></li>
                <li><Link href="/proposal" className="text-gray-400 hover:text-white">Generate Proposal</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link></li>
                <li><Link href="/profile" className="text-gray-400 hover:text-white">Company Profile</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><a href="mailto:support@rfpwinplatform.com" className="text-gray-400 hover:text-white">Support</a></li>
                <li><a href="mailto:sales@rfpwinplatform.com" className="text-gray-400 hover:text-white">Contact Sales</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}