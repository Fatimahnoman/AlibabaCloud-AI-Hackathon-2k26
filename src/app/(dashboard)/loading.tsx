export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200" />
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent absolute top-0" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
