"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { VerificationBadge } from "@/components/ui/verification-badge";

interface Source {
  _id: string;
  entityType: string;
  entityId: string;
  sourceUrl: string;
  sourceName?: string;
  sourceType: string;
  verificationStatus: string;
  lastVerifiedAt?: string;
  trustScore?: number;
}

interface SourceStats {
  total: number;
  verified: number;
  needsReview: number;
  unverified: number;
  expired: number;
}

type StatusFilter = "" | "verified" | "needs_review" | "unverified" | "expired" | "pending";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "needs_review", label: "Needs Review" },
  { value: "unverified", label: "Unverified" },
  { value: "expired", label: "Expired" },
  { value: "pending", label: "Pending" },
];

export default function VerificationDashboardPage() {
  const [stats, setStats] = useState<SourceStats | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [scheduledLoading, setScheduledLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const [statsRes, sourcesRes] = await Promise.all([
        apiClient.get<{ data: SourceStats }>("/api/sources/stats"),
        apiClient.get<{ data: Source[] }>(`/api/sources?${params}`),
      ]);
      setStats(statsRes.data);
      setSources(sourcesRes.data);
    } catch {
      setStats(null);
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerify = async (sourceId: string) => {
    setVerifyingId(sourceId);
    try {
      await apiClient.post(`/api/sources/${sourceId}/verify`);
      await fetchData();
    } catch {
      // silent
    } finally {
      setVerifyingId(null);
    }
  };

  const handleBulkVerify = async () => {
    setBulkLoading(true);
    try {
      await apiClient.post("/api/verification/bulk");
      await fetchData();
    } catch {
      // silent
    } finally {
      setBulkLoading(false);
    }
  };

  const handleScheduledVerify = async () => {
    setScheduledLoading(true);
    try {
      await apiClient.post("/api/verification/scheduled");
      await fetchData();
    } catch {
      // silent
    } finally {
      setScheduledLoading(false);
    }
  };

  const statCards = stats
    ? [
        { label: "Total Sources", value: stats.total, color: "text-gray-100" },
        { label: "Verified", value: stats.verified, color: "text-green-600" },
        { label: "Needs Review", value: stats.needsReview, color: "text-yellow-600" },
        { label: "Unverified", value: stats.unverified, color: "text-gray-500" },
        { label: "Expired", value: stats.expired, color: "text-red-600" },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <a href="/dashboard" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold text-gray-100">Verification Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and monitor data source verification</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkVerify}
            disabled={bulkLoading}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {bulkLoading ? "Running..." : "Bulk Verify"}
          </button>
          <button
            onClick={handleScheduledVerify}
            disabled={scheduledLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {scheduledLoading ? "Running..." : "Run Scheduled Verification"}
          </button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card p-6 space-y-2">
              <div className="h-4 skeleton rounded w-2/3" />
              <div className="h-8 skeleton rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="stat-card">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-blue-700 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{sources.length} sources</p>
        <Link href="/audit" className="text-sm text-blue-600 hover:underline">
          View Audit Logs
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 space-y-3">
              <div className="h-4 skeleton rounded w-1/3" />
              <div className="h-4 skeleton rounded w-2/3" />
              <div className="h-4 skeleton rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No sources found for the selected filter.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trust Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sources.map((source) => (
                <tr key={source._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-100">{source.entityType}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">{source.entityId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate block max-w-[250px]"
                    >
                      {source.sourceName || source.sourceUrl}
                    </a>
                    <span className="text-xs text-gray-400">{source.sourceType.replace("_", " ")}</span>
                  </td>
                  <td className="px-6 py-4">
                    <VerificationBadge
                      status={source.verificationStatus as 'verified' | 'needs_review' | 'unverified' | 'expired' | 'pending'}
                      lastVerifiedAt={source.lastVerifiedAt}
                    />
                  </td>
                  <td className="px-6 py-4">
                    {source.trustScore != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/5 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              source.trustScore >= 80
                                ? "bg-green-500"
                                : source.trustScore >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${source.trustScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-300">{source.trustScore}%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleVerify(source._id)}
                      disabled={verifyingId === source._id}
                      className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-50 transition-colors"
                    >
                      {verifyingId === source._id ? "Verifying..." : "Verify Now"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
