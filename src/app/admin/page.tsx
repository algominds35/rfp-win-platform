'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [lastReset, setLastReset] = useState<string>('');
  const [resetResult, setResetResult] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetchResetStatus();
    fetchCustomers();
  }, []);

  const fetchResetStatus = async () => {
    try {
      const response = await fetch('/api/reset-usage');
      const data = await response.json();
      setLastReset(data.lastReset);
    } catch (error) {
      console.error('Error fetching reset status:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/analytics?admin=true');
      const data = await response.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleMonthlyReset = async () => {
    setIsResetting(true);
    setResetResult('');
    
    try {
      const response = await fetch('/api/reset-usage', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setResetResult(`✅ Success! Reset usage for ${data.customersUpdated} customers`);
        fetchResetStatus();
        fetchCustomers();
      } else {
        setResetResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResetResult(`❌ Error: ${error}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔧 Admin Dashboard
          </h1>

          {/* Monthly Reset Section */}
          <div className="mb-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">
              📅 Monthly Usage Reset
            </h2>
            
            <div className="mb-4">
              <p className="text-gray-700">
                <strong>Last Reset:</strong> {lastReset === 'Never' ? 'Never' : new Date(lastReset).toLocaleString()}
              </p>
            </div>

            <button
              onClick={handleMonthlyReset}
              disabled={isResetting}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isResetting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isResetting ? '🔄 Resetting...' : '🔄 Reset All Customer Usage'}
            </button>

            {resetResult && (
              <div className="mt-4 p-4 rounded-lg bg-white border">
                <p>{resetResult}</p>
              </div>
            )}

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800">⚠️ Important:</h3>
              <p className="text-yellow-700 text-sm mt-1">
                This will reset the usage count to 0 for ALL customers. Run this at the beginning of each month.
              </p>
            </div>
          </div>

          {/* Customer Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              👥 Customer Usage Overview
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.plan_type === 'free' ? 'bg-gray-100 text-gray-800' :
                          customer.plan_type === 'basic' ? 'bg-blue-100 text-blue-800' :
                          customer.plan_type === 'pro' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {customer.plan_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.analyses_used} / {customer.analyses_limit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.analyses_used >= customer.analyses_limit ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Limit Reached
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📋 Monthly Reset Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Run the monthly reset on the 1st of each month</li>
              <li>This resets all customer usage counts to 0</li>
              <li>Customers can then use their monthly allowance again</li>
              <li>Consider setting up a cron job for automatic resets</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 