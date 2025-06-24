'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, Lock, User, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'free';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Stripe payment links for paid plans
  const stripeLinks = {
    basic: 'https://buy.stripe.com/test_dRm9AVfam1EP1MBbii0Fi00',
    pro: 'https://buy.stripe.com/test_5kQ00lfam2IT1MBeuu0Fi01', 
    enterprise: 'https://buy.stripe.com/test_dRm9AVfam1EP1MBbii0Fi00'
  };

  // Redirect paid plans to Stripe checkout immediately
  useEffect(() => {
    if (selectedPlan !== 'free' && stripeLinks[selectedPlan as keyof typeof stripeLinks]) {
      console.log(`🚀 Redirecting ${selectedPlan} plan to Stripe checkout`);
      window.location.href = stripeLinks[selectedPlan as keyof typeof stripeLinks];
    }
  }, [selectedPlan]);

  // If it's a paid plan, show loading while redirecting
  if (selectedPlan !== 'free') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Redirecting to Stripe Checkout...
          </h2>
          <p className="text-gray-600">
            Taking you to secure payment for the {selectedPlan} plan
          </p>
        </div>
      </div>
    );
  }

  const planDetails = {
    free: { name: 'Free Plan', price: '$0/month', analyses: 3 },
    basic: { name: 'Basic Plan', price: '$49/month', analyses: 25 },
    pro: { name: 'Professional Plan', price: '$299/month', analyses: 250 },
    enterprise: { name: 'Enterprise Plan', price: '$799/month', analyses: 5000 }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Store user info and redirect
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userPlan', selectedPlan);
        localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
        
        console.log('Signup success - stored user info:', {
          email: formData.email,
          plan: selectedPlan,
          name: `${formData.firstName} ${formData.lastName}`
        });
        
        router.push('/dashboard');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show signup form for FREE plan
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="h-5 w-5 mr-2 text-gray-600" />
              <div className="h-8 w-8 bg-blue-600 rounded mr-2"></div>
              <span className="text-xl font-bold text-gray-900">RFP Win Platform</span>
            </Link>
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto pt-12 pb-8 px-4">
        {/* Plan Selection Display */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {planDetails[selectedPlan as keyof typeof planDetails].name}
            </h2>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {planDetails[selectedPlan as keyof typeof planDetails].price}
            </p>
            <p className="text-gray-600">
              {planDetails[selectedPlan as keyof typeof planDetails].analyses} RFP analyses per month
            </p>
          </div>
        </div>

        {/* Signup Form - ONLY FOR FREE PLAN */}
        <div className="bg-white rounded-lg p-8 shadow-sm border">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Create Your Free Account
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Company Inc."
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 