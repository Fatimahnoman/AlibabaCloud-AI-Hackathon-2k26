"use client";

interface VerificationBadgeProps {
  status: 'verified' | 'needs_review' | 'unverified' | 'expired' | 'pending';
  lastVerifiedAt?: string | Date;
  compact?: boolean;
}

const statusConfig: Record<
  VerificationBadgeProps['status'],
  { bg: string; text: string; icon: string }
> = {
  verified: { bg: 'bg-green-100 text-green-800', text: 'Verified', icon: '✅' },
  needs_review: { bg: 'bg-yellow-100 text-yellow-800', text: 'Needs Review', icon: '⚠️' },
  unverified: { bg: 'bg-[#1e293b] text-gray-400', text: 'Unverified', icon: '❓' },
  expired: { bg: 'bg-red-100 text-red-800', text: 'Expired', icon: '❌' },
  pending: { bg: 'bg-blue-100 text-blue-800', text: 'Pending', icon: '⏳' },
};

function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

export function VerificationBadge({ status, lastVerifiedAt, compact = false }: VerificationBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg}`}
      >
        <span>{config.icon}</span>
        {!compact && <span>{config.text}</span>}
      </span>
      {lastVerifiedAt && (
        <span className="text-xs text-gray-400">
          Last checked: {formatRelativeTime(lastVerifiedAt)}
        </span>
      )}
    </div>
  );
}
