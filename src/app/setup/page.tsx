'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const setupDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to setup database' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">🚀 Database Setup</h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Click the button below to automatically create all missing database tables.
          </p>
          <p className="text-sm text-gray-500">
            This will fix the "relation does not exist" errors.
          </p>
        </div>

        <button
          onClick={setupDatabase}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '⏳ Setting up database...' : '🔧 Fix Database Now'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? '✅ Success!' : '❌ Error'}
            </h3>
            <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.message || result.error}
            </p>
            
            {result.success && (
              <div className="mt-4">
                <p className="text-green-700 font-medium">✅ Database is ready!</p>
                <p className="text-sm text-green-600 mt-2">
                  You can now go to your dashboard and everything should work.
                </p>
                <a 
                  href="/dashboard" 
                  className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                >
                  Go to Dashboard →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 