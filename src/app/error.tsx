'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-6 animate-scale-in">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-6">An unexpected error occurred. Please try again.</p>
        {error.digest && (
          <p className="text-xs text-gray-500 mb-4 font-mono">Error: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <a href="/education" className="btn-secondary">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
