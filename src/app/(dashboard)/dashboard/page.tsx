'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface DashboardData {
  user: { name: string; email: string; avatarUrl: string | null; country: string | null } | null;
  deadlines: {
    scholarships: Array<{ id: string; name: string; provider: string; deadline: string; amount: number | null; currency: string | null; country: string | null }>;
    internships: Array<{ id: string; title: string; organization: string; deadline: string | null; country: string }>;
  };
  budget: {
    income: number;
    expenses: number;
    balance: number;
    recentExpenses: Array<{ id: string; amount: number; description: string; categoryId: string; date: string }>;
  };
  applications: Array<{ id: string; title: string; institutionName: string | null; country: string | null; status: string; deadline: string | null; updatedAt: string }>;
  fraudScans: Array<{ id: string; inputType: string; riskLevel: string; riskScore: number; createdAt: string }>;
  documents: Array<{ id: string; originalName: string; status: string; createdAt: string }>;
  savings: Array<{ id: string; title: string; targetAmount: number; currentAmount: number; deadline: string | null }>;
  newScholarships: Array<{ id: string; name: string; provider: string; deadline: string | null; category: string | null; country: string | null }>;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(d: string | null) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  return diff;
}

function riskColor(level: string) {
  if (level === 'safe') return 'text-green-400';
  if (level === 'low') return 'text-emerald-400';
  if (level === 'medium') return 'text-yellow-400';
  if (level === 'high') return 'text-orange-400';
  return 'text-red-400';
}

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'researching') return 'bg-emerald-500/20 text-emerald-300';
  if (s === 'in_progress' || s === 'in-progress') return 'bg-yellow-500/20 text-yellow-300';
  if (s === 'submitted') return 'bg-purple-500/20 text-purple-300';
  if (s === 'accepted') return 'bg-green-500/20 text-green-300';
  if (s === 'rejected') return 'bg-red-500/20 text-red-300';
  return 'bg-gray-500/20 text-gray-300';
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ success: boolean; data: DashboardData }>('/api/dashboard')
      .then((res) => setData(res.data))
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

  const d = data;
  const greeting = d?.user?.name ? `Welcome back, ${d.user.name.split(' ')[0]}` : 'Dashboard';
  const urgentDeadlines = [...(d?.deadlines.scholarships || []), ...(d?.deadlines.internships || [])]
    .filter((x) => {
      const days = daysUntil(x.deadline);
      return days !== null && days <= 7;
    })
    .sort((a, b) => new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">{greeting}</h1>
          <p className="text-gray-400 text-sm mt-1">Here&apos;s what&apos;s happening with your education journey</p>
        </div>
        <div className="flex gap-2">
          <Link href="/education/scholarships" className="px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-sm font-medium transition-colors">
            Scholarships
          </Link>
          <Link href="/fraud/check-text" className="px-4 py-2 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/30 text-sm font-medium transition-colors">
            Fraud Check
          </Link>
        </div>
      </div>

      {/* Urgent Deadlines Alert */}
      {urgentDeadlines.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <h3 className="text-red-300 font-semibold flex items-center gap-2">
            <span className="text-lg">&#9888;</span>
            {urgentDeadlines.length} deadline{urgentDeadlines.length > 1 ? 's' : ''} this week!
          </h3>
          <div className="mt-2 space-y-1">
            {urgentDeadlines.map((dl, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{'name' in dl ? dl.name : dl.title}</span>
                <span className="text-red-300 font-medium">{daysUntil(dl.deadline)}d left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/budget" className="bg-card border border-border/50 rounded-2xl p-4 hover:border-green-500/30 transition-colors">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Budget Balance</p>
          <p className={`text-2xl font-bold mt-1 ${d && d.budget.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {d?.budget.balance ? `$${d.budget.balance.toFixed(0)}` : '$0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </Link>
        <Link href="/education/scholarships" className="bg-card border border-border/50 rounded-2xl p-4 hover:border-emerald-500/30 transition-colors">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Upcoming Deadlines</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">
            {(d?.deadlines.scholarships.length || 0) + (d?.deadlines.internships.length || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
        </Link>
        <Link href="/workspace" className="bg-card border border-border/50 rounded-2xl p-4 hover:border-violet-500/30 transition-colors">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Applications</p>
          <p className="text-2xl font-bold mt-1 text-purple-400">{d?.applications.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Active</p>
        </Link>
        <Link href="/fraud/history" className="bg-card border border-border/50 rounded-2xl p-4 hover:border-amber-500/30 transition-colors">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Fraud Scans</p>
          <p className="text-2xl font-bold mt-1 text-orange-400">{d?.fraudScans.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Recent</p>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Deadlines + Applications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Scholarship Deadlines */}
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Upcoming Deadlines</h3>
              <Link href="/notifications/deadlines" className="text-xs text-emerald-400 hover:underline">View all</Link>
            </div>
            {d?.deadlines.scholarships.length ? (
              <div className="space-y-3">
                {d.deadlines.scholarships.slice(0, 4).map((s) => {
                  const days = daysUntil(s.deadline);
                  return (
                    <div key={s.id} className="flex items-center justify-between bg-black/40 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-medium text-white">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.provider} {s.country ? `· ${s.country}` : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${days !== null && days <= 7 ? 'text-red-400' : days !== null && days <= 14 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {days !== null ? `${days}d` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">{s.deadline ? formatDate(s.deadline) : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No upcoming deadlines</p>
            )}
          </div>

          {/* Applications */}
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Application Tracker</h3>
              <Link href="/workspace" className="text-xs text-emerald-400 hover:underline">View all</Link>
            </div>
            {d?.applications.length ? (
              <div className="space-y-2">
                {d.applications.slice(0, 4).map((app) => (
                  <Link key={app.id} href={`/workspace/${app.id}`} className="flex items-center justify-between bg-black/40 rounded-xl p-3 hover:bg-black/60 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{app.title}</p>
                      <p className="text-xs text-gray-500">{app.institutionName || 'No institution'} {app.country ? `· ${app.country}` : ''}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No applications yet</p>
                <Link href="/workspace/new" className="text-xs text-emerald-400 hover:underline mt-1 inline-block">Create your first application</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions + Savings + Fraud */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/education/scholarships" className="flex flex-col items-center p-3 bg-black/40 rounded-xl hover:bg-black/60 transition-colors">
                <span className="text-2xl mb-1">&#127891;</span>
                <span className="text-xs text-gray-400">Scholarships</span>
              </Link>
              <Link href="/education/universities" className="flex flex-col items-center p-3 bg-black/40 rounded-xl hover:bg-black/60 transition-colors">
                <span className="text-2xl mb-1">&#127979;</span>
                <span className="text-xs text-gray-400">Universities</span>
              </Link>
              <Link href="/fraud/check-text" className="flex flex-col items-center p-3 bg-black/40 rounded-xl hover:bg-black/60 transition-colors">
                <span className="text-2xl mb-1">&#128270;</span>
                <span className="text-xs text-gray-400">Scan Text</span>
              </Link>
              <Link href="/budget" className="flex flex-col items-center p-3 bg-black/40 rounded-xl hover:bg-black/60 transition-colors">
                <span className="text-2xl mb-1">&#128176;</span>
                <span className="text-xs text-gray-400">Budget</span>
              </Link>
            </div>
          </div>

          {/* Savings Goals */}
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Savings Goals</h3>
              <Link href="/budget/savings" className="text-xs text-emerald-400 hover:underline">View all</Link>
            </div>
            {d?.savings.length ? (
              <div className="space-y-3">
                {d.savings.map((goal) => {
                  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{goal.title}</span>
                        <span className="text-gray-400">{pct}%</span>
                      </div>
                      <div className="h-2 bg-dark rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-2">No savings goals yet</p>
            )}
          </div>

          {/* Recent Fraud Scans */}
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Security Scans</h3>
              <Link href="/fraud/history" className="text-xs text-emerald-400 hover:underline">History</Link>
            </div>
            {d?.fraudScans.length ? (
              <div className="space-y-2">
                {d.fraudScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between bg-black/40 rounded-xl p-2">
                    <div>
                      <span className="text-xs text-gray-400 uppercase">{scan.inputType}</span>
                      <p className="text-xs text-gray-500">{formatDate(scan.createdAt)}</p>
                    </div>
                    <span className={`text-sm font-bold ${riskColor(scan.riskLevel)}`}>
                      {scan.riskScore}/100
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-2">No recent scans</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
