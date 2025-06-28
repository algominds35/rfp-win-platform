'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setupDemo();
  }, []);

  const setupDemo = async () => {
    try {
      // Setup demo user and profile
      const response = await fetch('/api/demo-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        // Store demo user info in localStorage
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userPlan', data.user.plan);
        localStorage.setItem('demoMode', 'true');

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Failed to setup demo');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error occurred');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🚀 Setting Up Your Demo</h1>
        <div className="space-y-2 text-gray-600">
          <p>✅ Creating demo user account</p>
          <p>✅ Setting up company profile</p>
          <p>✅ Configuring AI capabilities</p>
          <p className="text-blue-600 font-medium">Redirecting to dashboard...</p>
        </div>
      </div>
    </div>
  );
} 