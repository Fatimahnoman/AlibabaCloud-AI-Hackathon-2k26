export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200" />
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent absolute top-0" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-100">Loading EduGuard AI</p>
          <p className="text-xs text-gray-500 mt-0.5">Preparing your experience...</p>
        </div>
      </div>
    </div>
  );
}
