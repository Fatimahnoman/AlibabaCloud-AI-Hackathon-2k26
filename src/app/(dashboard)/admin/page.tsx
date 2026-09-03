"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface SystemOverview {
  generatedAt: string;
  users: { total: number; active: number; newToday: number; newThisWeek: number; newThisMonth: number; byRole: Record<string, number> };
  conversations: { total: number; today: number; thisWeek: number };
  messages: { total: number; today: number };
  fraud: { totalReports: number; pending: number; resolved: number; highRisk: number };
  documents: { total: number; today: number };
  aiUsage: { totalConversations: number; avgMessagesPerConversation: number };
  security: { failedLoginsToday: number; suspiciousActivities: number };
  system: { uptimeMs: number; nodeEnv: string; dbSize: string; memoryUsageMB: number };
}

function formatNum(n: number) { return n.toLocaleString(); }
function formatUptime(ms: number) {
  const m = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(m / 1440); const h = Math.floor((m % 1440) / 60); const mi = m % 60;
  return `${d}d ${h}h ${mi}m`;
}
function secScore(s: SystemOverview["security"]) { return Math.max(0, Math.min(100, 100 - s.failedLoginsToday * 3 - s.suspiciousActivities * 5)); }

export default function AdminDashboardPage() {
  const [data, setData] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: SystemOverview }>("/api/admin/system/overview");
      setData(res.data);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const i = setInterval(load, 30000); return () => clearInterval(i); }, [load]);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 skeleton" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-64 skeleton rounded-2xl" />)}
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="gradient-text font-semibold">Unable to load dashboard</p>
        <p className="text-sm text-red-400 mt-1">{error}</p>
        <button onClick={() => { setLoading(true); setError(null); load(); }} className="btn-primary mt-4">Retry</button>
      </div>
    </div>
  );

  const score = secScore(data.security);
  const roles = Object.entries(data.users.byRole).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex flex-wrap items-start justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-sm mt-2">Platform-wide <span className="text-emerald-400 font-medium">health</span>, <span className="text-emerald-400 font-medium">activity</span> & <span className="text-red-400 font-medium">security</span> at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge badge-success gap-1.5">
            <span className="pulse-dot pulse-dot-green" />
            Live
          </span>
          <button onClick={load} className="btn-rainbow text-sm px-4 py-2">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={formatNum(data.users.total)} icon={<UsersIcon />} gradient="from-emerald-500 via-teal-500 to-teal-500" trend={`+${data.users.newToday} today`} trendColor="text-emerald-400" delay={0} />
        <StatCard title="Active Users" value={formatNum(data.users.active)} icon={<ShieldIcon />} gradient="from-emerald-500 via-green-500 to-lime-500" trend={`${data.users.total > 0 ? Math.round(data.users.active / data.users.total * 100) : 0}% active`} trendColor="text-emerald-400" delay={50} />
        <StatCard title="New Today" value={formatNum(data.users.newToday)} icon={<SparkleIcon />} gradient="from-violet-500 via-purple-500 to-fuchsia-500" trend={`${data.users.newThisWeek} this week`} trendColor="text-purple-400" delay={100} />
        <StatCard title="Conversations" value={formatNum(data.conversations.total)} icon={<ChatIcon />} gradient="from-emerald-500 via-teal-500 to-indigo-500" trend={`${data.conversations.today} today`} trendColor="text-emerald-400" delay={150} />
        <StatCard title="Fraud Reports" value={formatNum(data.fraud.totalReports)} icon={<AlertIcon />} gradient="from-amber-500 via-orange-500 to-red-500" trend={`${data.fraud.pending} pending`} trendColor="text-amber-400" delay={200} />
        <StatCard title="Security Score" value={`${score}`} icon={<ShieldCheckIcon />} gradient={score > 80 ? "from-emerald-500 via-teal-500 to-teal-400" : score > 50 ? "from-amber-500 via-orange-500 to-yellow-500" : "from-red-500 via-rose-500 to-pink-500"} trend={score > 80 ? "Excellent" : score > 50 ? "Needs attention" : "Critical"} trendColor={score > 80 ? "text-emerald-400" : score > 50 ? "text-amber-400" : "text-red-400"} delay={250} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="User Growth" gradient="from-indigo-500 to-teal-400">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Today" value={data.users.newToday} gradient="from-indigo-500 via-purple-500 to-violet-500" />
            <MiniStat label="This Week" value={data.users.newThisWeek} gradient="from-emerald-500 via-teal-500 to-teal-500" />
            <MiniStat label="This Month" value={data.users.newThisMonth} gradient="from-purple-500 via-pink-500 to-rose-500" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {roles.map(([r, c]) => (
              <span key={r} className="badge badge-info capitalize">{r}: {c}</span>
            ))}
          </div>
        </Panel>

        <Panel title="Activity Feed" gradient="from-emerald-500 to-teal-500">
          <div className="space-y-3">
            <ActivityRow label="Conversations today" value={formatNum(data.conversations.today)} gradient="from-emerald-500 to-teal-400" />
            <ActivityRow label="Messages today" value={formatNum(data.messages.today)} gradient="from-emerald-500 to-indigo-500" />
            <ActivityRow label="This week" value={formatNum(data.conversations.thisWeek)} gradient="from-indigo-500 to-violet-500" />
            <ActivityRow label="Avg msgs/conversation" value={String(data.aiUsage.avgMessagesPerConversation)} gradient="from-purple-500 to-fuchsia-500" />
            <ActivityRow label="Documents today" value={formatNum(data.documents.today)} gradient="from-amber-500 to-orange-500" />
          </div>
        </Panel>

        <Panel title="Security" gradient="from-emerald-500 to-teal-500" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Score</span>
                <span className={`text-2xl font-bold ${score > 80 ? 'text-emerald-400' : score > 50 ? 'text-amber-400' : 'text-red-400'}`}>{score}/100</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-bar-fill ${score > 80 ? 'progress-bar-fill-green' : score > 50 ? 'progress-bar-fill-amber' : 'progress-bar-fill-red'}`} style={{ width: `${score}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SecRow label="Failed logins" value={data.security.failedLoginsToday} danger />
              <SecRow label="Suspicious activity" value={data.security.suspiciousActivities} danger />
              <SecRow label="Pending fraud" value={data.fraud.pending} danger />
              <SecRow label="High-risk fraud" value={data.fraud.highRisk} danger />
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="System Info" gradient="from-violet-500 to-purple-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoTile label="Uptime" value={formatUptime(data.system.uptimeMs)} icon="⏱" gradient="from-emerald-500 to-teal-500" />
          <InfoTile label="Environment" value={data.system.nodeEnv} icon="⚙" gradient="from-amber-500 to-orange-500" />
          <InfoTile label="Database" value={data.system.dbSize} icon="🗄" gradient="from-emerald-500 to-indigo-500" />
          <InfoTile label="Memory" value={`${Math.round(data.system.memoryUsageMB)} MB`} icon="💻" gradient="from-violet-500 to-purple-500" />
        </div>
      </Panel>

      <Panel title="Quick Actions" gradient="from-rose-500 to-pink-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionCard href="/admin/users" label="Manage Users" desc="Roles, bans & accounts" icon={<UsersIcon />} gradient="from-emerald-500 via-teal-500 to-teal-500" />
          <ActionCard href="/admin/security" label="Security Center" desc="Threats & audit" icon={<ShieldIcon />} gradient="from-emerald-500 via-green-500 to-lime-500" />
          <ActionCard href="/admin/data" label="Data Management" desc="Content & sources" icon={<DatabaseIcon />} gradient="from-violet-500 via-purple-500 to-fuchsia-500" />
          <ActionCard href="/admin/ai-monitor" label="AI Monitor" desc="Usage & performance" icon={<BrainIcon />} gradient="from-amber-500 via-orange-500 to-red-500" />
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, children, gradient, className = "" }: { title: string; children: React.ReactNode; gradient?: string; className?: string }) {
  return (
    <div className={`rounded-2xl overflow-hidden animate-slide-up ${className}`} style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${gradient || 'from-indigo-500 to-teal-400'}`} />
        <h2 className={`text-sm font-bold uppercase tracking-wider bg-gradient-to-r ${gradient || 'from-indigo-500 to-teal-400'} bg-clip-text text-transparent`}>{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient, trend, trendColor, delay }: { title: string; value: string; icon: React.ReactNode; gradient: string; trend: string; trendColor: string; delay: number }) {
  return (
    <div className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl animate-slide-up"
      style={{ animationDelay: `${delay}ms`, background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-3xl font-bold gradient-text">{value}</p>
          <p className={`text-sm font-semibold mt-1 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{title}</p>
          <p className={`text-xs mt-2 font-medium ${trendColor}`}>{trend}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, gradient }: { label: string; value: number; gradient: string }) {
  return (
    <div className="group relative rounded-xl p-4 text-center overflow-hidden transition-all duration-300 hover:scale-105" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${gradient}`} />
      <p className="relative text-2xl font-bold gradient-text">{formatNum(value)}</p>
      <p className={`relative text-xs font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mt-1`}>{label}</p>
    </div>
  );
}

function ActivityRow({ label, value, gradient }: { label: string; value: string; gradient: string }) {
  return (
    <div className="flex items-center gap-3 group py-1">
      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradient} shrink-0 group-hover:scale-125 transition-transform`} />
      <span className={`flex-1 text-sm font-medium bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-[1.02] transition-all origin-left`}>{label}</span>
      <span className="text-sm font-bold gradient-text">{value}</span>
    </div>
  );
}

function SecRow({ label, value, danger }: { label: string; value: number; danger: boolean }) {
  const colors = danger && value > 0
    ? 'from-red-500 to-pink-500'
    : danger
      ? 'from-emerald-500 to-teal-500'
      : 'from-gray-400 to-gray-500';
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${danger && value > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5 border border-white/10'}`}>
      <span className={`text-xs font-semibold bg-gradient-to-r ${colors} bg-clip-text text-transparent`}>{label}</span>
      <span className={`text-sm font-bold ${danger ? (value > 0 ? 'text-red-400' : 'text-emerald-400') : 'gradient-text'}`}>{value}</span>
    </div>
  );
}

function InfoTile({ label, value, icon, gradient }: { label: string; value: string; icon: string; gradient: string }) {
  return (
    <div className="group relative flex items-center gap-4 p-5 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-medium bg-gradient-to-r ${gradient} bg-clip-text text-transparent uppercase tracking-wide`}>{label}</p>
        <p className={`text-base font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent truncate mt-0.5`}>{value}</p>
      </div>
    </div>
  );
}

function ActionCard({ href, label, desc, icon, gradient }: { href: string; label: string; desc: string; icon: React.ReactNode; gradient: string }) {
  return (
    <Link href={href} className="group relative p-5 rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        {icon}
      </div>
      <p className={`text-base font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-[1.02] transition-all duration-300 origin-left`}>{label}</p>
      <p className={`text-sm bg-gradient-to-r ${gradient} bg-clip-text text-transparent mt-1 transition-colors`}>{desc}</p>
    </Link>
  );
}

function UsersIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" /></svg>; }
function ShieldIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>; }
function ShieldCheckIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>; }
function SparkleIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>; }
function ChatIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>; }
function AlertIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>; }
function DatabaseIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>; }
function BrainIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>; }
