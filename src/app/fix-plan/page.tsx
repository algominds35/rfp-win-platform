'use client';

import { useState } from 'react';

export default function FixPlanPage() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fixPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to fix plan' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-6">Fix Plan Status</h1>
          <p className="text-gray-600 mb-6">
            If you've paid for a plan but still seeing free plan limits, use this tool to fix your account.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Plan Type</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="free">Free (3 analyses/month)</option>
                <option value="basic">Basic (25 analyses/month) - $49</option>
                <option value="pro">Professional (250 analyses/month) - $299</option>
                <option value="enterprise">Enterprise (5000 analyses/month) - $799</option>
              </select>
            </div>
            
            <button
              onClick={fixPlan}
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Fixing Plan...' : 'Fix My Plan'}
            </button>
          </div>
          
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {result.success ? (
                <div>
                  <h3 className="font-semibold">✅ Plan Fixed Successfully!</h3>
                  <p>{result.message}</p>
                  <p className="text-sm mt-2">Refresh your dashboard to see the updated limits.</p>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold">❌ Error</h3>
                  <p>{result.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 