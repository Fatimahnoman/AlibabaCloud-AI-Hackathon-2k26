'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  if (isAuthenticated) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">EduGuard AI</h1>
        <p className="text-lg text-gray-400 mb-8">
          AI-powered platform for education guidance, fraud detection, and smart budgeting.
          Supporting English, Roman Urdu, and Urdu.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Education</h2>
            <p className="text-gray-400">University finder, scholarship search, career guidance</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Security</h2>
            <p className="text-gray-400">Fraud detection, URL scanning, cyber reporting</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold text-green-600 mb-2">Budget</h2>
            <p className="text-gray-400">Smart budgeting, expense tracking, financial planning</p>
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="btn-primary">Get Started</Link>
          <Link href="/login" className="btn-secondary">Sign In</Link>
        </div>
      </div>
    </main>
  );
}
