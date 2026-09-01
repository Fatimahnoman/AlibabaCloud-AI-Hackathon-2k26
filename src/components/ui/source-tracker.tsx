"use client";

import { useState } from "react";
import { VerificationBadge } from "./verification-badge";
import type { VerificationStatus } from "@/types/source";

interface SourceInfo {
  id: string;
  sourceUrl: string;
  sourceName?: string;
  sourceType: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string | Date;
}

interface SourceTrackerProps {
  sources: SourceInfo[];
  compact?: boolean;
  showVerifyButton?: boolean;
  onVerify?: (sourceId: string) => void;
}

const sourceTypeColors: Record<string, string> = {
  official: "bg-blue-100 text-blue-800",
  government: "bg-purple-100 text-purple-800",
  third_party: "bg-orange-100 text-orange-800",
  user_submitted: "bg-[#1e293b] text-gray-400",
  scraped: "bg-teal-100 text-teal-800",
};

export function SourceTracker({
  sources,
  compact = false,
  showVerifyButton = false,
  onVerify,
}: SourceTrackerProps) {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  if (sources.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No sources recorded.</p>
    );
  }

  const handleVerify = async (sourceId: string) => {
    setVerifyingId(sourceId);
    try {
      onVerify?.(sourceId);
    } finally {
      setVerifyingId(null);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {sources.map((source) => (
          <a
            key={source.id}
            href={source.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#1e293b] bg-[#0b1120] px-2 py-1 text-xs text-gray-400 hover:bg-[#1e293b] transition-colors"
            title={source.sourceName || source.sourceUrl}
          >
            <span className="truncate max-w-[160px]">{source.sourceName || source.sourceUrl}</span>
            <VerificationBadge
              status={source.verificationStatus}
              compact
            />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <div
          key={source.id}
          className="flex items-start justify-between rounded-lg border border-[#1e293b] p-4 hover:bg-[#0b1120] transition-colors"
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={source.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline truncate"
              >
                {source.sourceName || source.sourceUrl}
              </a>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  sourceTypeColors[source.sourceType] || "bg-[#1e293b] text-gray-400"
                }`}
              >
                {source.sourceType.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate">{source.sourceUrl}</p>
            <VerificationBadge
              status={source.verificationStatus}
              lastVerifiedAt={source.lastVerifiedAt}
            />
          </div>

          {showVerifyButton && (
            <button
              onClick={() => handleVerify(source.id)}
              disabled={verifyingId === source.id}
              className="ml-4 shrink-0 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {verifyingId === source.id ? "Verifying..." : "Verify"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
