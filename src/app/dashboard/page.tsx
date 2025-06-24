'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Upload, FileText, Settings, LogOut, Building, TrendingUp, DollarSign, Target, Clock, Award, Users, BarChart3, Calendar, Filter, Download } from 'lucide-react';

interface AnalyticsData {
  analytics: {
    totalRfps: number;
    winRate: number;
    pipelineValue: number;
    avgResponseTime: number;
    rfpsThisMonth: number;
    proposalsGenerated: number;
    activeProposals: number;
  };
  usage: {
    rfpsUsed: number;
    rfpLimit: number;
    proposalsUsed: number;
    proposalLimit: number;
    planType: string;
    remaining: {
      rfps: number;
      proposals: number;
    };
  };
  pipeline: Array<{
    id: string;
    title: string;
    client: string;
    value: string;
    status: 'draft' | 'submitted' | 'won' | 'lost' | 'in_progress';
    winProbability: number;
    date: string;
  }>;
}

export default function Dashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data as fallback
  const mockData = {
    analytics: {
      totalRfps: 127,
      winRate: 82,
      pipelineValue: 4200000,
      avgResponseTime: 2.3,
      rfpsThisMonth: 15,
      proposalsGenerated: 104,
      activeProposals: 23
    },
    usage: {
      rfpsUsed: 18,
      rfpLimit: 250, // Professional plan - 250 RFPs per month
      proposalsUsed: 22,
      proposalLimit: 250, // Professional plan - 250 proposals per month
      planType: 'professional',
      remaining: { rfps: 232, proposals: 228 }
    },
    pipeline: [
      { id: '1', title: 'Enterprise Software Development RFP', client: 'TechCorp Industries', value: '$850K', status: 'won' as const, winProbability: 85, date: '2025-01-15' },
      { id: '2', title: 'Healthcare System Integration', client: 'Regional Medical Center', value: '$620K', status: 'submitted' as const, winProbability: 72, date: '2025-01-12' },
      { id: '3', title: 'Financial Services Modernization', client: 'Metropolitan Bank', value: '$1.2M', status: 'in_progress' as const, winProbability: 90, date: '2025-01-10' },
      { id: '4', title: 'Government Digital Transformation', client: 'City Government', value: '$950K', status: 'won' as const, winProbability: 88, date: '2025-01-08' },
      { id: '5', title: 'E-commerce Platform Development', client: 'RetailMax Corp', value: '$420K', status: 'lost' as const, winProbability: 45, date: '2025-01-05' },
    ]
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        // Use mock data if API fails (for demo purposes)
        console.log('Using mock data - API not available yet');
        setAnalyticsData(mockData);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Use mock data as fallback
      setAnalyticsData(mockData);
      setError('Using demo data - database not connected');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const handleExport = () => {
    if (!analyticsData) return;
    
    // Create CSV content
    const headers = ['RFP Title', 'Client', 'Value', 'Win Probability', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...analyticsData.pipeline.map(item => [
        `"${item.title || ''}"`,
        `"${item.client || ''}"`,
        `"${item.value || ''}"`,
        `"${item.winProbability || 0}%"`,
        `"${(item.status || '').replace('_', ' ')}"`,
        `"${item.date || ''}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rfp-pipeline-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const data = analyticsData || mockData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RFP Win Platform</span>
              <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full capitalize">
                {data.usage.planType === 'none' ? 'Free' : data.usage.planType} Plan
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back!</span>
              {error && (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {error}
                </span>
              )}
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <LogOut className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Intelligence Dashboard</h1>
          <p className="text-gray-600">Track your RFP performance, revenue pipeline, and win analytics</p>
        </div>

        {/* Usage Tracking Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Monthly Usage</h2>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
                {data.usage.planType === 'none' ? 'Free' : data.usage.planType} Plan
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Resets on 1st of each month
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RFP Analyses Usage */}
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">RFP Analyses</span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {data.usage.rfpsUsed}/{data.usage.rfpLimit === 999999 ? '∞' : data.usage.rfpLimit}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Used this month</span>
                  <span>{data.usage.remaining.rfps} remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      data.usage.rfpsUsed / data.usage.rfpLimit > 0.8 ? 'bg-red-500' :
                      data.usage.rfpsUsed / data.usage.rfpLimit > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min((data.usage.rfpsUsed / (data.usage.rfpLimit === 999999 ? 1000 : data.usage.rfpLimit)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {data.usage.remaining.rfps <= 5 && data.usage.rfpLimit !== 999999 && (
                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mt-2">
                  ⚠️ Only {data.usage.remaining.rfps} analyses remaining
                </div>
              )}
            </div>

            {/* Proposal Generation Usage */}
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="font-medium text-gray-900">Proposals Generated</span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {data.usage.proposalsUsed}/{data.usage.proposalLimit === 999999 ? '∞' : data.usage.proposalLimit}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Used this month</span>
                  <span>{data.usage.remaining.proposals} remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      data.usage.proposalsUsed / data.usage.proposalLimit > 0.8 ? 'bg-red-500' :
                      data.usage.proposalsUsed / data.usage.proposalLimit > 0.6 ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}
                    style={{ 
                      width: `${Math.min((data.usage.proposalsUsed / (data.usage.proposalLimit === 999999 ? 1000 : data.usage.proposalLimit)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {data.usage.remaining.proposals <= 5 && data.usage.proposalLimit !== 999999 && (
                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mt-2">
                  ⚠️ Only {data.usage.remaining.proposals} remaining
                </div>
              )}
            </div>
          </div>

          {/* Upgrade CTA if approaching limits */}
          {(data.usage.remaining.rfps <= 10 || data.usage.remaining.proposals <= 10) && data.usage.planType !== 'enterprise' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-orange-900">Running low on usage</h4>
                  <p className="text-sm text-orange-700">Upgrade your plan to continue analyzing RFPs</p>
                </div>
                <Link 
                  href="/#pricing"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  Upgrade Plan
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total RFPs */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total RFPs</p>
                <p className="text-3xl font-bold text-gray-900">{data.analytics.totalRfps}</p>
                <p className="text-sm text-green-600 mt-1">↗ +{data.analytics.rfpsThisMonth} this month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-3xl font-bold text-gray-900">{data.analytics.winRate}%</p>
                <p className="text-sm text-green-600 mt-1">{data.analytics.proposalsGenerated} proposals</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Revenue Pipeline */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.analytics.pipelineValue)}</p>
                <p className="text-sm text-blue-600 mt-1">{data.analytics.activeProposals} active</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Avg. Response Time */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-3xl font-bold text-gray-900">{data.analytics.avgResponseTime || 2.3}h</p>
                <p className="text-sm text-green-600 mt-1">↘ -67% with AI</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Upload New RFP */}
          <Link href="/upload" className="group">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <Upload className="h-8 w-8" />
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Start New</p>
                  <p className="text-2xl font-bold">RFP Analysis</p>
                </div>
              </div>
              <p className="text-blue-100">Upload and analyze new RFP documents with AI-powered insights</p>
              {data.usage.planType !== 'none' && (
                <p className="text-xs text-blue-200 mt-2">
                  {data.usage.remaining.rfps} RFPs remaining
                </p>
              )}
            </div>
          </Link>

          {/* Company Profile */}
          <Link href="/profile" className="group">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <Building className="h-8 w-8" />
                <div className="text-right">
                  <p className="text-green-100 text-sm">Optimize</p>
                  <p className="text-2xl font-bold">Company Profile</p>
                </div>
              </div>
              <p className="text-green-100">Enhance your capabilities and improve proposal quality</p>
            </div>
          </Link>

          {/* Generate Proposal */}
          <Link href="/proposal" className="group">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <Award className="h-8 w-8" />
                <div className="text-right">
                  <p className="text-orange-100 text-sm">Create</p>
                  <p className="text-2xl font-bold">Winning Proposal</p>
                </div>
              </div>
              <p className="text-orange-100">Generate professional proposals that win more business</p>
              {data.usage.planType !== 'none' && (
                <p className="text-xs text-orange-200 mt-2">
                  {data.usage.remaining.proposals} proposals remaining
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Recent RFPs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active RFP Pipeline</h2>
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <button 
                  onClick={handleExport}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFP Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Probability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.pipeline.length > 0 ? data.pipeline.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.client}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.value}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 mr-2">{item.winProbability}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${item.winProbability}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.date}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-sm">No RFPs yet. Upload your first RFP to get started!</p>
                        <Link href="/upload" className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Upload RFP →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}