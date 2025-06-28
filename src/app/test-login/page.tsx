'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestLogin() {
  const router = useRouter();

  useEffect(() => {
    // Just set a test user and redirect to dashboard
    localStorage.setItem('userEmail', 'test@example.com');
    localStorage.setItem('userPlan', 'free');
    
    // Redirect to dashboard immediately
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Logging you in...</h2>
        <p className="text-gray-600">Redirecting to dashboard</p>
      </div>
    </div>
  );
} 