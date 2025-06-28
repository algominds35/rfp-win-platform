'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, FileText, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

interface UserStats {
  usage: number;
  limit: number;
  plan: string;
  rfpsAnalyzed: number;
  proposalsGenerated: number;
  winRate: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupDemoAndLoadStats();
  }, []);

  const setupDemoAndLoadStats = async () => {
    try {
      // Setup demo user first
      const setupResponse = await fetch('/api/demo-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (setupResponse.ok) {
        const setupData = await setupResponse.json();
        
        // Store demo user info
        localStorage.setItem('userEmail', setupData.user.email);
        localStorage.setItem('userName', setupData.user.name);
        localStorage.setItem('userPlan', setupData.user.plan);
        localStorage.setItem('demoMode', 'true');
      }

      // Load user stats
      const userEmail = localStorage.getItem('userEmail') || 'demo@rfpwin.com';
      const response = await fetch(`/api/analytics?userId=${userEmail}`);
      const data = await response.json();

      if (data.success) {
        setStats({
          usage: data.usage.current,
          limit: data.usage.limit,
          plan: data.usage.planType,
          rfpsAnalyzed: data.analytics.rfpsAnalyzed || 0,
          proposalsGenerated: data.analytics.proposalsGenerated || 0,
          winRate: data.analytics.winRate || 0
        });
      } else {
        // Fallback demo stats
        setStats({
          usage: 0,
          limit: 250,
          plan: 'professional',
          rfpsAnalyzed: 0,
          proposalsGenerated: 0,
          winRate: 0
        });
      }
    } catch (error) {
      console.error('Setup error:', error);
      // Fallback demo stats
      setStats({
        usage: 0,
        limit: 250,
        plan: 'professional',
        rfpsAnalyzed: 0,
        proposalsGenerated: 0,
        winRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your demo workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded"></div>
              <span className="ml-2 text-xl font-bold text-gray-900">RFP Win Platform</span>
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                DEMO MODE
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {localStorage.getItem('userName') || 'Demo User'}
              </span>
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Welcome to RFP Win Platform Demo
          </h1>
          <p className="text-gray-600">
            This is a fully functional demo. Upload RFPs, generate proposals, and see the AI in action!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usage This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.usage || 0}/{stats?.limit || 250}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">RFPs Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.rfpsAnalyzed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Proposals Generated</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.proposalsGenerated || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{stats?.plan || 'Professional'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/upload"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <PlusCircle className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">Upload New RFP</p>
                  <p className="text-sm text-blue-700">Get AI analysis in 30 seconds</p>
                </div>
              </Link>
              
              <Link 
                href="/proposal"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FileText className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">Generate Proposal</p>
                  <p className="text-sm text-green-700">Create winning proposals</p>
                </div>
              </Link>
              
              <Link 
                href="/profile"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Users className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-purple-900">Company Profile</p>
                  <p className="text-sm text-purple-700">Customize your company info</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Demo Features</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Real OpenAI GPT-4 integration</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Actual PDF processing</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Professional proposal generation</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Database persistence</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">PDF export functionality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎮 How to Test the Demo</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-medium text-gray-900 mb-2">Upload RFP</h4>
              <p className="text-sm text-gray-600">Click "Upload New RFP" and upload any PDF document</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-600">Watch as AI analyzes requirements and criteria</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-medium text-gray-900 mb-2">Generate Proposal</h4>
              <p className="text-sm text-gray-600">Create and download professional proposals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}