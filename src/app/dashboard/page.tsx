'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RFP {
  id: number;
  title: string;
  client_name: string;
  value: string;
  status: string;
  created_at: string;
  analysis_data: any;
}

interface Proposal {
  id: number;
  title: string;
  rfp_id: number;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({ rfpsUsed: 0, rfpLimit: 25, planType: 'basic' });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user analytics/usage
      const analyticsRes = await fetch('/api/analytics');
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setUsage(analyticsData.usage || { rfpsUsed: 0, rfpLimit: 25, planType: 'basic' });
      }

      // For now, we'll show sample data since we know there are RFPs in the database
      setRfps([
        {
          id: 1,
          title: "Cloud Infrastructure Migration",
          client_name: "TechCorp Inc.",
          value: "$150,000",
          status: "analyzed",
          created_at: "2025-01-25",
          analysis_data: {}
        },
        {
          id: 2,
          title: "AI Analytics Platform",
          client_name: "DataFlow LLC",
          value: "$85,000", 
          status: "analyzed",
          created_at: "2025-01-25",
          analysis_data: {}
        }
      ]);

      setProposals([
        {
          id: 1,
          title: "Cloud Migration Proposal",
          rfp_id: 1,
          status: "draft",
          created_at: "2025-01-25"
        },
        {
          id: 2,
          title: "AI Analytics Proposal", 
          rfp_id: 2,
          status: "submitted",
          created_at: "2025-01-25"
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <p className="text-gray-600">Manage your RFPs and winning proposals</p>
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
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <h3 className="text-lg font-semibold ml-3">Start New</h3>
            </div>
            <h2 className="text-xl font-bold mb-2">RFP Analysis</h2>
            <p className="text-blue-100 mb-2">Upload and analyze new RFP documents with AI-powered insights</p>
            <p className="text-sm text-blue-200">{usage.rfpLimit - usage.rfpsUsed} RFPs remaining</p>
          </div>

          <div 
            onClick={() => router.push('/profile')}
            className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-3">Optimize</h3>
            </div>
            <h2 className="text-xl font-bold mb-2">Company Profile</h2>
            <p className="text-green-100 mb-2">Enhance your capabilities and improve proposal quality</p>
            <p className="text-sm text-green-200">Enhance your capabilities and improve proposal quality</p>
          </div>

          <div 
            onClick={() => router.push('/proposal')}
            className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-3">Create</h3>
            </div>
            <h2 className="text-xl font-bold mb-2">Winning Proposal</h2>
            <p className="text-red-100 mb-2">Generate professional proposals that win more business</p>
            <p className="text-sm text-red-200">{proposals.length} proposals remaining</p>
          </div>
        </div>

        {/* RFP Pipeline */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Active RFP Pipeline</h2>
              <p className="text-gray-600 text-sm">Track and manage your RFP analyses</p>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">High (85%)</td>
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
              <p className="mt-1 text-sm text-gray-500">Upload your first RFP to get started!</p>
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
                      <p className="text-sm text-gray-500">Created {proposal.created_at}</p>
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