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

interface VerificationSnapshot {
  _id: string;
  verifiedAt: string;
  status: string;
  trustScore?: number;
  notes?: string;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history, setHistory] = useState<VerificationSnapshot[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({ sourceUrl: "", sourceName: "", sourceType: "third_party", entityType: "", entityId: "" });
  const [addingSource, setAddingSource] = useState(false);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: Source[] }>("/api/sources");
      setSources(res.data);
    } catch {
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setHistory([]);
      return;
    }
    setExpandedId(id);
    setHistoryLoading(true);
    try {
      const res = await apiClient.get<{ data: VerificationSnapshot[] }>(`/api/sources/${id}/history`);
      setHistory(res.data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleVerify = async (sourceId: string) => {
    setVerifyingId(sourceId);
    try {
      await apiClient.post(`/api/sources/${sourceId}/verify`);
      await fetchSources();
    } catch {
      // silent
    } finally {
      setVerifyingId(null);
    }
  };

  const handleFlag = async (sourceId: string) => {
    setFlaggingId(sourceId);
    try {
      await apiClient.post(`/api/sources/${sourceId}/flag`);
      await fetchSources();
    } catch {
      // silent
    } finally {
      setFlaggingId(null);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSource(true);
    try {
      await apiClient.post("/api/sources", newSource);
      setNewSource({ sourceUrl: "", sourceName: "", sourceType: "third_party", entityType: "", entityId: "" });
      setShowAddForm(false);
      await fetchSources();
    } catch {
      // silent
    } finally {
      setAddingSource(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Source Management</h1>
          <p className="text-gray-500 mt-1">View, verify, and manage all data sources</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/verification"
            className="btn-secondary"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add Source"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSource} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Add New Source</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="url"
              placeholder="Source URL *"
              required
              value={newSource.sourceUrl}
              onChange={(e) => setNewSource((s) => ({ ...s, sourceUrl: e.target.value }))}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Source Name"
              value={newSource.sourceName}
              onChange={(e) => setNewSource((s) => ({ ...s, sourceName: e.target.value }))}
              className="input-field"
            />
            <select
              value={newSource.sourceType}
              onChange={(e) => setNewSource((s) => ({ ...s, sourceType: e.target.value }))}
              className="input-field"
            >
              <option value="official">Official</option>
              <option value="government">Government</option>
              <option value="third_party">Third Party</option>
              <option value="user_submitted">User Submitted</option>
              <option value="scraped">Scraped</option>
            </select>
            <input
              type="text"
              placeholder="Entity Type *"
              required
              value={newSource.entityType}
              onChange={(e) => setNewSource((s) => ({ ...s, entityType: e.target.value }))}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Entity ID *"
              required
              value={newSource.entityId}
              onChange={(e) => setNewSource((s) => ({ ...s, entityId: e.target.value }))}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={addingSource}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {addingSource ? "Adding..." : "Add Source"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse space-y-3">
              <div className="h-4 skeleton rounded w-1/3" />
              <div className="h-4 skeleton rounded w-2/3" />
              <div className="h-4 skeleton rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No sources found. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => (
            <div key={source._id} className="card overflow-hidden">
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleExpand(source._id)}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-100">
                      {source.sourceName || source.sourceUrl}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-gray-400">
                      {source.sourceType.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate max-w-[500px]">{source.sourceUrl}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Entity: {source.entityType}</span>
                    {source.trustScore != null && (
                      <span>Trust: {source.trustScore}%</span>
                    )}
                  </div>
                  <VerificationBadge
                    status={source.verificationStatus as 'verified' | 'needs_review' | 'unverified' | 'expired' | 'pending'}
                    lastVerifiedAt={source.lastVerifiedAt}
                  />
                </div>

                <div className="flex items-center gap-2 ml-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleVerify(source._id)}
                    disabled={verifyingId === source._id}
                    className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                  >
                    {verifyingId === source._id ? "Verifying..." : "Verify"}
                  </button>
                  <button
                    onClick={() => handleFlag(source._id)}
                    disabled={flaggingId === source._id}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                  >
                    {flaggingId === source._id ? "Flagging..." : "Flag"}
                  </button>
                  <span className="text-gray-400 text-sm">{expandedId === source._id ? "▲" : "▼"}</span>
                </div>
              </div>

              {expandedId === source._id && (
                <div className="border-t border-white/10 px-6 py-4 bg-white/5">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Verification History</h4>
                  {historyLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-4 skeleton rounded animate-pulse w-2/3" />
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No verification history available.</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((snap) => (
                        <div
                          key={snap._id}
                          className="flex items-center justify-between rounded-md border border-white/10 card px-4 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <VerificationBadge
                              status={snap.status as 'verified' | 'needs_review' | 'unverified' | 'expired' | 'pending'}
                              compact
                            />
                            <span className="text-xs text-gray-500">
                              {new Date(snap.verifiedAt).toLocaleString()}
                            </span>
                            {snap.trustScore != null && (
                              <span className="text-xs text-gray-400">Score: {snap.trustScore}%</span>
                            )}
                          </div>
                          {snap.notes && (
                            <span className="text-xs text-gray-400 max-w-[200px] truncate">{snap.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
