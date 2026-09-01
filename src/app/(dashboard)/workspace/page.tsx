'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface ChecklistItem {
  id: string;
  isCompleted: boolean;
}

interface Workspace {
  id: string;
  entityType: string;
  title: string;
  programName?: string;
  institutionName?: string;
  country?: string;
  deadline?: string;
  status: string;
  priority: string;
  notes?: string;
  officialUrl?: string;
  checklistItems: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceSummary {
  total: number;
  byStatus: Record<string, number>;
  upcomingDeadlines: { id: string; title: string; deadline: string; daysLeft: number }[];
  overallProgress: number;
}

const statusColors: Record<string, string> = {
  researching: 'bg-blue-500/10 text-blue-400',
  preparing: 'bg-yellow-500/10 text-yellow-400',
  documents_ready: 'bg-purple-500/10 text-purple-400',
  submitted: 'bg-indigo-500/10 text-indigo-400',
  under_review: 'bg-orange-500/10 text-orange-400',
  accepted: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
  waitlisted: 'bg-white/5 text-gray-200',
  deferred: 'bg-amber-500/10 text-amber-400',
  withdrawn: 'bg-white/5 text-gray-200',
};

const priorityColors: Record<string, string> = {
  low: 'bg-white/5 text-gray-400',
  medium: 'bg-blue-500/10 text-blue-400',
  high: 'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
};

const statusLabels: Record<string, string> = {
  researching: 'Researching',
  preparing: 'Preparing',
  documents_ready: 'Docs Ready',
  submitted: 'Submitted',
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  deferred: 'Deferred',
  withdrawn: 'Withdrawn',
};

export default function WorkspaceDashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (entityFilter) params.set('entityType', entityFilter);
      params.set('page', String(page));
      params.set('limit', '10');

      const [wsRes, summaryRes] = await Promise.all([
        apiClient.get<{ data: { workspaces: Workspace[]; pagination: { totalPages: number } } }>(
          `/api/workspace?${params}`
        ),
        apiClient.get<{ data: WorkspaceSummary }>('/api/workspace/summary'),
      ]);

      setWorkspaces(wsRes.data.workspaces);
      setTotalPages(wsRes.data.pagination.totalPages);
      setSummary(summaryRes.data);
    } catch {
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, entityFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function getDaysLeft(deadline?: string): number | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getChecklistProgress(items: ChecklistItem[]): number {
    if (items.length === 0) return 0;
    return Math.round((items.filter((i) => i.isCompleted).length / items.length) * 100);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Application Workspace</h1>
          <p className="text-gray-500 mt-1">Track and manage your applications</p>
        </div>
        <Link href="/workspace/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          + New Application
        </Link>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-6">
            <p className="text-sm text-gray-500">Total Applications</p>
            <p className="text-3xl font-bold text-gray-100 mt-1">{summary.total}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500">Overall Progress</p>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl font-bold text-gray-100">{summary.overallProgress}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${summary.overallProgress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-2">By Status</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(summary.byStatus).filter(([, count]) => count > 0).map(([status, count]) => (
                <span key={status} className={`text-xs px-2 py-0.5 rounded-full ${statusColors[status] || 'bg-white/5 text-gray-400'}`}>
                  {statusLabels[status] || status}: {count}
                </span>
              ))}
              {Object.values(summary.byStatus).every((c) => c === 0) && (
                <span className="text-xs text-gray-400">No applications yet</span>
              )}
            </div>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-2">Upcoming Deadlines</p>
            {summary.upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-gray-400 mt-1">No upcoming deadlines</p>
            ) : (
              <div className="space-y-1">
                {summary.upcomingDeadlines.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 truncate max-w-[120px]">{d.title}</span>
                    <span className={`font-medium ${d.daysLeft <= 7 ? 'text-red-600' : d.daysLeft <= 30 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {d.daysLeft}d left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">All Statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">All Types</option>
            <option value="university">University</option>
            <option value="scholarship">Scholarship</option>
            <option value="course">Course</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse space-y-3">
              <div className="h-5 skeleton rounded w-1/2" />
              <div className="h-4 skeleton rounded w-1/3" />
              <div className="h-3 skeleton rounded w-full" />
            </div>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No applications found</p>
          <Link href="/workspace/new" className="text-blue-600 hover:underline font-medium">
            Create your first application
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {workspaces.map((ws) => {
            const progress = getChecklistProgress(ws.checklistItems);
            const daysLeft = getDaysLeft(ws.deadline);

            return (
              <Link
                key={ws.id}
                href={`/workspace/${ws.id}`}
                className="block card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-100 truncate">{ws.title}</h3>
                    {ws.institutionName && (
                      <p className="text-sm text-gray-400 truncate">{ws.institutionName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[ws.status] || 'bg-white/5 text-gray-400'}`}>
                      {statusLabels[ws.status] || ws.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${priorityColors[ws.priority] || 'bg-white/5 text-gray-400'}`}>
                      {ws.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="capitalize">{ws.entityType}</span>
                  {ws.programName && <span>{ws.programName}</span>}
                  {ws.country && <span>{ws.country}</span>}
                  {ws.deadline && (
                    <span className={daysLeft !== null && daysLeft <= 7 ? 'text-red-600 font-medium' : ''}>
                      Deadline: {new Date(ws.deadline).toLocaleDateString()}
                      {daysLeft !== null && daysLeft > 0 && ` (${daysLeft}d left)`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {ws.checklistItems.filter((i) => i.isCompleted).length}/{ws.checklistItems.length}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-sm border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-sm border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
