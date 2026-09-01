'use client';

import { useState, FormEvent } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devResetLink, setDevResetLink] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await apiClient.post<{ data: { message: string; resetLink?: string } }>('/api/auth/forgot-password', { email });
      if (res.data.resetLink) {
        setDevResetLink(res.data.resetLink);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card text-center">
        <div className="mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Check your email</h2>
        <p className="text-gray-400 mb-6">
          If an account exists with <strong>{email}</strong>, we&apos;ve sent a password reset link.
        </p>

        {devResetLink && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-left">
            <p className="text-amber-400 text-sm font-semibold mb-2">
              Development Mode — Email delivery not configured
            </p>
            <p className="text-gray-400 text-xs mb-3">
              Use this link directly to reset your password:
            </p>
            <a
              href={devResetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Reset Password Now
            </a>
            <p className="text-gray-500 text-xs mt-2 break-all">
              {devResetLink}
            </p>
          </div>
        )}

        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-center mb-2">Reset your password</h2>
      <p className="text-center text-gray-400 mb-6">Enter your email and we&apos;ll send you a reset link.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} className="input-field" placeholder="you@example.com" disabled={isLoading} />
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Remember your password?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
