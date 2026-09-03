'use client';

import { useState, useEffect, useCallback } from 'react';

interface FraudReport {
  id: string;
  inputType: string;
  riskLevel: string;
  riskScore: string;
  recommendation: string;
  inputContent: string;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const typeLabels: Record<string, string> = {
  sms: 'SMS',
  text: 'Text',
  email: 'Email',
  url: 'URL',
  document: 'Document',
  image: 'Image',
};

const typeBadgeColors: Record<string, string> = {
  sms: 'bg-emerald-500/10 text-emerald-400',
  text: 'bg-indigo-500/10 text-indigo-400',
  email: 'bg-purple-500/10 text-purple-400',
  url: 'bg-emerald-500/10 text-emerald-400',
  document: 'bg-white/5 text-gray-200',
  image: 'bg-pink-500/10 text-pink-400',
};

const riskBadgeColors: Record<string, string> = {
  safe: 'bg-green-500/10 text-green-400',
  low: 'bg-yellow-500/10 text-yellow-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  high: 'bg-orange-500/10 text-orange-400',
  critical: 'bg-red-500/10 text-red-400',
};

export default function FraudHistoryPage() {
  const [reports, setReports] = useState<FraudReport[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReports = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const res = await fetch(`/api/fraud/reports?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load reports');

      const data = await res.json();
      const payload = data.data ?? data;
      const newReports = payload.reports || [];
      setReports(prev => append ? [...prev, ...newReports] : newReports);
      setPagination({ total: payload.total || 0, page: payload.page || page, limit: payload.limit || 20, totalPages: payload.totalPages || 0 });
    } catch {
      setError('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`/api/fraud/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      }
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadMore = () => {
    const nextPage = pagination.page + 1;
    fetchReports(nextPage, true);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <a href="/fraud" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Fraud Center
        </a>
        <h1 className="text-2xl font-bold text-gray-100">Previous Checks</h1>
        <p className="text-gray-500 mt-1">Your fraud scan history</p>
      </div>

      {loading && reports.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-5 skeleton rounded w-16" />
                <div className="h-5 skeleton rounded w-20" />
                <div className="h-5 skeleton rounded w-24 ml-auto" />
              </div>
              <div className="h-4 skeleton rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-gray-500">No scan history yet. Run your first fraud check!</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{pagination.total} scans found</p>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="card">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                >
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeBadgeColors[report.inputType] || 'bg-white/5 text-gray-200'}`}>
                    {typeLabels[report.inputType] || report.inputType}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskBadgeColors[report.riskLevel] || 'bg-white/5 text-gray-200'}`}>
                    {report.riskLevel?.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">{formatDate(report.createdAt)}</span>
                  <span className="text-gray-400 text-sm">{expandedId === report.id ? '▲' : '▼'}</span>
                </div>

                <p className="text-sm text-gray-400 mt-2">{report.recommendation || 'No summary available'}</p>

                {expandedId === report.id && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap mb-3">
                      {report.inputContent || 'No content available'}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">Score: {Number(report.riskScore) || 0}/100</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this scan record?')) {
                        handleDelete(report.id);
                      }
                    }}
                    disabled={deletingId === report.id}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                  >
                    {deletingId === report.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.page < pagination.totalPages && (
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="btn-secondary text-sm"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
