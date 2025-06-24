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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-6">🚀 Database Setup</h1>
          
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Click the button below to check your database and create missing tables.
            </p>
            <p className="text-sm text-gray-500">
              This will fix the "relation does not exist" errors on Vercel.
            </p>
          </div>

          <div className="text-center mb-8">
            <button
              onClick={setupDatabase}
              disabled={isLoading}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Checking database...' : '🔧 Check Database Status'}
            </button>
          </div>

          {result && (
            <div className={`p-6 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <h3 className={`font-semibold text-lg mb-3 ${result.success ? 'text-green-800' : 'text-yellow-800'}`}>
                {result.success ? '✅ Database Ready!' : '⚠️ Manual Setup Required'}
              </h3>
              
              <p className={`mb-4 ${result.success ? 'text-green-700' : 'text-yellow-700'}`}>
                {result.message}
              </p>

              {result.success && (
                <div className="space-y-3">
                  <p className="text-green-700 font-medium">
                    Environment: {result.environment || 'Unknown'}
                  </p>
                  <div className="bg-green-100 p-3 rounded">
                    <p className="text-sm text-green-800">
                      All database tables are ready! Your RFP platform should work perfectly now.
                    </p>
                  </div>
                  <a 
                    href="/dashboard" 
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Go to Dashboard →
                  </a>
                </div>
              )}

              {!result.success && result.sqlScript && (
                <div className="space-y-4">
                  <div className="bg-yellow-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">📋 Manual Setup Instructions:</h4>
                    <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                      <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                      <li>Select your project</li>
                      <li>Go to "SQL Editor" in the left sidebar</li>
                      <li>Copy the SQL script below and paste it</li>
                      <li>Click "Run" to execute the script</li>
                      <li>Come back here and click "Check Database Status" again</li>
                    </ol>
                  </div>

                  {result.missingTables && (
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <p className="text-red-800 font-medium">Missing Tables:</p>
                      <p className="text-red-700 text-sm">{result.missingTables.join(', ')}</p>
                    </div>
                  )}

                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white font-semibold">SQL Script to Run:</h4>
                      <button
                        onClick={() => copyToClipboard(result.sqlScript)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <pre className="text-green-400 text-xs overflow-x-auto whitespace-pre-wrap">
                      {result.sqlScript}
                    </pre>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={setupDatabase}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                      🔄 Check Again
                    </button>
                  </div>
                </div>
              )}

              {result.tableStatus && (
                <div className="mt-4 bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-800 mb-2">Table Status:</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {Object.entries(result.tableStatus).map(([table, exists]) => (
                      <div key={table} className={`p-2 rounded ${exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <span className="font-medium">{table}:</span> {exists ? '✅' : '❌'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 