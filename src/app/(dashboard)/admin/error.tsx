'use client';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md text-center px-4 animate-slide-up">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Admin Panel Error</h1>
        <p className="text-gray-500 mb-2">{error.message || 'An error occurred in the admin panel.'}</p>
        {error.digest && (
          <p className="text-xs text-gray-500 mb-4 font-mono">Error: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <a href="/admin" className="btn-secondary">
            Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
