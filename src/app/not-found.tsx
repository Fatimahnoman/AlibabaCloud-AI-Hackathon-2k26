import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-100 to-emerald-100 flex items-center justify-center mb-6 animate-scale-in">
          <span className="text-4xl font-bold gradient-text">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-6">The page you are looking for does not exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/education" className="btn-primary">
            Go to Education
          </Link>
          <Link href="/login" className="btn-secondary">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
