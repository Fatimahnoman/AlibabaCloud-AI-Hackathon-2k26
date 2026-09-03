'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface Application {
  id: string;
  title: string;
  institutionName: string | null;
  country: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  officialUrl: string | null;
  notes: string | null;
  programName: string | null;
  createdAt: string;
  updatedAt: string;
}

function statusIcon(status: string) {
  const s = status.toLowerCase();
  if (s === 'researching') return { icon: '&#128269;', color: 'bg-emerald-500', label: 'Researching' };
  if (s === 'in_progress' || s === 'in-progress') return { icon: '&#9997;', color: 'bg-yellow-500', label: 'In Progress' };
  if (s === 'submitted') return { icon: '&#128232;', color: 'bg-purple-500', label: 'Submitted' };
  if (s === 'under_review') return { icon: '&#9203;', color: 'bg-indigo-500', label: 'Under Review' };
  if (s === 'accepted') return { icon: '&#9989;', color: 'bg-green-500', label: 'Accepted' };
  if (s === 'rejected') return { icon: '&#10060;', color: 'bg-red-500', label: 'Rejected' };
  if (s === 'withdrawn') return { icon: '&#9888;', color: 'bg-gray-500', label: 'Withdrawn' };
  return { icon: '&#128203;', color: 'bg-gray-500', label: status };
}

function priorityColor(priority: string) {
  const p = priority.toLowerCase();
  if (p === 'high') return 'text-red-400 bg-red-500/10';
  if (p === 'medium') return 'text-yellow-400 bg-yellow-500/10';
  return 'text-gray-400 bg-gray-500/10';
}

function daysUntil(d: string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ApplicationTimelinePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ success: boolean; data: { applications: Application[] } }>('/api/workspace')
      .then((res) => setApplications(res.data.applications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  // Group by status
  const stages = [
    { key: 'researching', label: 'Researching' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const grouped = stages.map((stage) => ({
    ...stage,
    apps: applications.filter((a) => a.status === stage.key),
  })).filter((g) => g.apps.length > 0);

  // Also include any statuses not in our predefined stages
  const knownKeys = stages.map((s) => s.key);
  const otherApps = applications.filter((a) => !knownKeys.includes(a.status));
  if (otherApps.length > 0) {
    grouped.push({ key: 'other', label: 'Other', apps: otherApps });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <a href="/education" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Education Center
          </a>
          <h1 className="text-2xl font-bold gradient-text">Application Timeline</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track all your university and scholarship applications
          </p>
        </div>
        <Link href="/workspace/new" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          + New Application
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{applications.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{applications.filter((a) => ['in_progress', 'researching'].includes(a.status)).length}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{applications.filter((a) => ['submitted', 'under_review'].includes(a.status)).length}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{applications.filter((a) => a.status === 'accepted').length}</p>
          <p className="text-xs text-gray-500">Accepted</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-4">&#128203;</p>
          <h3 className="text-lg font-semibold text-white mb-2">No applications yet</h3>
          <p className="text-gray-400 text-sm">Start tracking your university and scholarship applications.</p>
          <Link href="/workspace/new" className="mt-4 inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors">
            Create First Application
          </Link>
        </div>
      ) : (
        /* Timeline */
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/30" />

          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.key}>
                {/* Stage Header */}
                <div className="flex items-center gap-3 mb-4 relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${group.apps[0] ? statusIcon(group.apps[0].status).color : 'bg-gray-500'} z-10 shadow-lg`}>
                    <span className="text-white text-lg" dangerouslySetInnerHTML={{ __html: statusIcon(group.key).icon }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{group.label}</h2>
                    <p className="text-xs text-gray-500">{group.apps.length} application{group.apps.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Applications in this stage */}
                <div className="ml-16 space-y-3">
                  {group.apps.map((app) => {
                    const days = daysUntil(app.deadline);
                    return (
                      <Link
                        key={app.id}
                        href={`/workspace/${app.id}`}
                        className="block bg-card border border-border/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-medium text-white">{app.title}</h3>
                            <p className="text-sm text-gray-400">
                              {app.institutionName || 'No institution'}
                              {app.programName ? ` · ${app.programName}` : ''}
                              {app.country ? ` · ${app.country}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColor(app.priority)}`}>
                              {app.priority}
                            </span>
                            {days !== null && (
                              <span className={`text-xs font-medium ${days <= 0 ? 'text-red-400' : days <= 7 ? 'text-orange-400' : 'text-gray-400'}`}>
                                {days <= 0 ? 'Expired' : `${days}d left`}
                              </span>
                            )}
                          </div>
                        </div>
                        {app.notes && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{app.notes}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>Created: {formatDate(app.createdAt)}</span>
                          <span>Updated: {formatDate(app.updatedAt)}</span>
                          {app.deadline && <span>Deadline: {formatDate(app.deadline)}</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
