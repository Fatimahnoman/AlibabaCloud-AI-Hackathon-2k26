'use client';

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-90" />
      <div className="relative z-10 w-full max-w-md text-center px-4 animate-slide-up">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0f172a]/20 backdrop-blur-sm flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
        <p className="text-white/70 mb-6">{error.message || 'An error occurred during authentication.'}</p>
        {error.digest && (
          <p className="text-xs text-white/50 mb-4 font-mono">Error: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <a href="/login" className="px-5 py-2.5 rounded-xl font-semibold text-white border border-white/30 hover:bg-[#0f172a]/10 transition-all duration-200">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
