'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestUserPage() {
  const [testEmail, setTestEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testUser = async () => {
    if (!testEmail) {
      alert('Please enter an email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?email=${encodeURIComponent(testEmail)}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to fetch user data' });
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    if (!testEmail) {
      alert('Please enter an email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/create-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to create test data' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Test User Analytics</h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Test Email Address
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test@example.com"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={testUser}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test User Analytics'}
            </button>

            <button
              onClick={createTestData}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Test Data'}
            </button>
          </div>

          {result && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-4">Quick Actions:</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  localStorage.setItem('userEmail', 'algomind6@gmail.com');
                  alert('Set user email to algomind6@gmail.com');
                }}
                className="block w-full bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200"
              >
                Set Email to algomind6@gmail.com (Your Paid Account)
              </button>
              <Link 
                href="/signup?plan=free" 
                className="block bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200"
              >
                Test Free Signup
              </Link>
              <Link 
                href="/dashboard" 
                className="block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200"
              >
                Go to Dashboard
              </Link>
              <Link 
                href="/" 
                className="block bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 