'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RFP {
  id: string;
  title: string;
  client_name: string;
  value: string;
  status: string;
  created_at: string;
  win_probability?: number;
}

interface Proposal {
  id: string;
  title: string;
  rfp_id: string;
  status: string;
  created_at: string;
  client_name?: string;
  estimated_value?: number;
}

interface Analytics {
  totalRfps: number;
  winRate: number;
  pipelineValue: number;
  avgResponseTime: number;
  rfpsThisMonth: number;
  proposalsGenerated: number;
  activeProposals: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({ rfpsUsed: 0, rfpLimit: 3, planType: 'free' });
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRfps: 0,
    winRate: 0,
    pipelineValue: 0,
    avgResponseTime: 0,
    rfpsThisMonth: 0,
    proposalsGenerated: 0,
    activeProposals: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get user email from localStorage or session
      const userEmail = localStorage.getItem('userEmail') || 'demo-user@example.com';
      
      // Load REAL analytics data from API
      const analyticsRes = await fetch(`/api/analytics?email=${encodeURIComponent(userEmail)}`);
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        
        // Set REAL usage data
        setUsage(data.usage || { rfpsUsed: 0, rfpLimit: 3, planType: 'free' });
        
        // Set REAL analytics
        setAnalytics(data.analytics || {
          totalRfps: 0,
          winRate: 0,
          pipelineValue: 0,
          avgResponseTime: 0,
          rfpsThisMonth: 0,
          proposalsGenerated: 0,
          activeProposals: 0
        });

        // Convert pipeline data to RFP format
        const pipelineData = data.pipeline || [];
        const rfpData: RFP[] = pipelineData.map((item: any) => ({
          id: item.id,
          title: item.title,
          client_name: item.client,
          value: item.value,
          status: item.status,
          created_at: item.date,
          win_probability: item.winProbability
        }));
        
        setRfps(rfpData);

        // Convert pipeline to proposals (proposals are generated from RFPs)
        const proposalData: Proposal[] = pipelineData
          .filter((item: any) => ['submitted', 'won', 'in_progress', 'draft'].includes(item.status))
          .map((item: any) => ({
            id: item.id,
            title: `Proposal: ${item.title}`,
            rfp_id: item.id,
            status: item.status,
            created_at: item.date,
            client_name: item.client,
            estimated_value: parseFloat(item.value.replace(/[$,]/g, '')) || 0
          }));
          
        setProposals(proposalData);

        console.log('Dashboard loaded REAL data:', {
          rfps: rfpData.length,
          proposals: proposalData.length,
          usage: data.usage,
          analytics: data.analytics
        });
      } else {
        console.error('Failed to load analytics:', analyticsRes.status);
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed': 
      case 'won': 
        return 'bg-green-100 text-green-800';
      case 'draft': 
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted': 
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'lost': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RFP Win Platform</h1>
              <p className="text-gray-600">AI-powered RFP analysis and proposal generation</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {usage.planType.charAt(0).toUpperCase() + usage.planType.slice(1)} Plan • {usage.rfpLimit - usage.rfpsUsed}/{usage.rfpLimit} remaining
              </span>
              <button
                onClick={() => router.push('/upload')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New RFP
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{analytics.totalRfps}</p>
                <p className="text-gray-600 text-sm">Total RFPs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{analytics.winRate}%</p>
                <p className="text-gray-600 text-sm">Win Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">${analytics.pipelineValue.toLocaleString()}</p>
                <p className="text-gray-600 text-sm">Pipeline Value</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{analytics.avgResponseTime}d</p>
                <p className="text-gray-600 text-sm">Avg Response</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div 
            onClick={() => router.push('/upload')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-3">Analyze RFP</h3>
            </div>
            <h2 className="text-xl font-bold mb-2">Upload & Analyze</h2>
            <p className="text-blue-100 mb-2">Upload RFP documents and get AI-powered analysis</p>
            <p className="text-sm text-blue-200">{usage.rfpLimit - usage.rfpsUsed} analyses remaining</p>
          </div>

          <div 
            onClick={() => router.push('/proposal')}
            className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-3">Generate Proposal</h3>
            </div>
            <h2 className="text-xl font-bold mb-2">Create Winning Proposals</h2>
            <p className="text-green-100 mb-2">Generate professional proposals from analyzed RFPs</p>
            <p className="text-sm text-green-200">{analytics.activeProposals} active proposals</p>
          </div>
        </div>
              
        {/* RFP Pipeline */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Active RFP Pipeline</h2>
              <p className="text-gray-600 text-sm">Track and manage your RFP analyses and proposals</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">Filter</button>
              <button className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">Export</button>
            </div>
          </div>

          {rfps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFP DETAILS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VALUE</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WIN PROBABILITY</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rfps.map((rfp) => (
                    <tr key={rfp.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/proposal?rfp=${rfp.id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{rfp.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rfp.client_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rfp.value}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rfp.win_probability || 75}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfp.status)}`}>
                          {rfp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfp.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No RFPs yet</h3>
              <p className="mt-1 text-sm text-gray-500">Upload your first RFP to get started with AI-powered analysis!</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/upload')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload RFP →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Proposals */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Proposals</h2>
            <p className="text-gray-600 text-sm">Your generated proposals and their status</p>
          </div>

          {proposals.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{proposal.title}</h3>
                      <p className="text-sm text-gray-500">
                        {proposal.client_name} • Created {proposal.created_at} • 
                        {proposal.estimated_value ? ` $${proposal.estimated_value.toLocaleString()}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      <button 
                        onClick={() => router.push(`/proposal?id=${proposal.id}`)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View/Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No proposals yet. Create your first proposal from an analyzed RFP!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}