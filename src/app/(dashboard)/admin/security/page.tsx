"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface ApiResponse<T> { success: boolean; data: T; }
interface OffendingIp { ip: string; count: number; lastAttempt: string; }
interface SuspiciousItem { id: string; action: string; entityType: string; entityId: string; details: Record<string, unknown> | null; ipAddress: string | null; userAgent: string | null; createdAt: string; user: { id: string; email: string; name: string; role: string } | null; }
interface SecurityData { generatedAt: string; failedLogins: { total: number; today: number; last7Days: number; byIp: OffendingIp[] }; suspiciousActivity: SuspiciousItem[]; activeSessions: number; securityScore: number; factors: { failedLoginsToday: number; inactiveAccountRatio: number; unresolvedHighRiskReports: number }; }
type Tone = "good" | "warn" | "danger";
interface Recommendation { tone: Tone; text: string; }

const SUSPICIOUS_BADGES: Record<string, string> = {
  LOGIN_FAILED: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  UNAUTHORIZED: "bg-red-500/15 text-red-400 border border-red-500/20",
};

const TONE_STYLES: Record<Tone, string> = {
  good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-300",
};

const TONE_DOTS: Record<Tone, string> = { good: "bg-emerald-400", warn: "bg-amber-400", danger: "bg-red-400" };

function scoreTheme(score: number) {
  if (score >= 80) return { stroke: "#10b981", text: "text-emerald-400", ring: "bg-emerald-400", label: "Good" };
  if (score >= 50) return { stroke: "#f59e0b", text: "text-amber-400", ring: "bg-amber-400", label: "Needs Attention" };
  return { stroke: "#ef4444", text: "text-red-400", ring: "bg-red-400", label: "At Risk" };
}

function relativeTime(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function formatDateTime(ts: string): string { return ts ? new Date(ts).toLocaleString() : "—"; }

function buildRecommendations(data: SecurityData): Recommendation[] {
  const recs: Recommendation[] = [];
  const { failedLoginsToday: failedToday, inactiveAccountRatio, unresolvedHighRiskReports } = data.factors;
  const topIp = data.failedLogins.byIp[0];
  const unauthorizedCount = data.suspiciousActivity.filter(a => a.action === "UNAUTHORIZED").length;
  if (data.securityScore >= 85) recs.push({ tone: "good", text: "Overall security posture is strong. Continue monitoring failed login trends daily." });
  if (failedToday >= 20) recs.push({ tone: "danger", text: `${failedToday} failed logins recorded today. Enable stricter rate limiting and consider temporary IP blocks.` });
  else if (failedToday > 0) recs.push({ tone: "warn", text: `${failedToday} failed login${failedToday === 1 ? "" : "s"} today. Watch the trend to rule out brute-force attempts.` });
  if (unauthorizedCount > 0) recs.push({ tone: "danger", text: `${unauthorizedCount} unauthorized access event${unauthorizedCount === 1 ? "" : "s"} detected. Verify role assignments and protected routes immediately.` });
  if (topIp && topIp.count >= 10) recs.push({ tone: "warn", text: `IP ${topIp.ip} generated ${topIp.count} failed attempts. Consider blocking it at the firewall or proxy layer.` });
  if (inactiveAccountRatio > 0.25) recs.push({ tone: "warn", text: `${Math.round(inactiveAccountRatio * 100)}% of accounts are inactive. Audit stale accounts and revoke leftover sessions.` });
  if (unresolvedHighRiskReports > 0) recs.push({ tone: "warn", text: `${unresolvedHighRiskReports} unresolved high-risk fraud report${unresolvedHighRiskReports === 1 ? "" : "s"}. Prioritize triage to reduce exposure.` });
  if (data.activeSessions > 100) recs.push({ tone: "warn", text: `${data.activeSessions} active sessions detected. Review for anomalies during off-hours.` });
  if (recs.length === 0) recs.push({ tone: "good", text: "No immediate threats detected. Maintain current monitoring cadence." });
  return recs.slice(0, 6);
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);
  const theme = scoreTheme(score);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-52 h-52 -rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="16" />
        <circle cx="100" cy="100" r={radius} fill="none" stroke={theme.stroke} strokeWidth="16" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold tabular-nums ${theme.text}`}>{score}</span>
        <span className={`mt-1 text-xs font-medium uppercase tracking-widest bg-gradient-to-r ${score >= 80 ? 'from-emerald-400 to-green-400' : score >= 50 ? 'from-amber-400 to-yellow-400' : 'from-red-400 to-pink-400'} bg-clip-text text-transparent`}>{theme.label}</span>
      </div>
    </div>
  );
}

export default function AdminSecurityPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSecurity = useCallback(async () => {
    setLoading(true); setError("");
    try { const res = await apiClient.get<ApiResponse<SecurityData>>("/api/admin/system/security"); setData(res.data); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load security overview"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSecurity(); }, [fetchSecurity]);

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="h-10 w-72 skeleton" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="rounded-2xl border border-white/10 shadow-sm p-6 space-y-4 animate-pulse" style={{ background: 'rgba(15, 23, 42, 0.9)' }}><div className="h-4 skeleton rounded w-1/3" /><div className="h-32 skeleton rounded" /></div>)}
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="animate-fade-in">
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4">{error || "No data available."}</div>
      <button onClick={fetchSecurity} className="mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-blue-600 transition-all">Retry</button>
    </div>
  );

  const theme = scoreTheme(data.securityScore);
  const recommendations = buildRecommendations(data);
  const loginBars = [
    { label: "All Time", value: data.failedLogins.total },
    { label: "Last 7 Days", value: data.failedLogins.last7Days },
    { label: "Today", value: data.failedLogins.today },
  ];
  const maxBarValue = Math.max(1, ...loginBars.map(b => b.value));

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex flex-wrap items-start justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Security Center</h1>
          <p className="mt-2"><span className="text-red-400 font-medium">Threat</span> overview, <span className="text-amber-400 font-medium">failed logins</span> and <span className="text-emerald-400 font-medium">session</span> activity</p>
        </div>
        <button onClick={fetchSecurity} className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">Refresh</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 rounded-2xl overflow-hidden p-6 flex flex-col items-center justify-center animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '50ms' }}>
          <p className="self-start text-xs font-medium uppercase tracking-widest bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">Security Score</p>
          <ScoreGauge score={data.securityScore} />
          <p className="mt-4 text-xs text-cyan-400">Generated {relativeTime(data.generatedAt)}</p>
        </div>

        <div className="xl:col-span-1 rounded-2xl overflow-hidden p-6 animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Failed Logins</h2>
            <span className={`h-2.5 w-2.5 rounded-full ${theme.ring}`} />
          </div>
          <div className="mt-6 flex items-end justify-around gap-4 h-44">
            {loginBars.map(bar => (
              <div key={bar.label} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                <span className="text-lg font-bold gradient-text tabular-nums">{bar.value.toLocaleString()}</span>
                <div className="w-full max-w-[56px] rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-400 transition-all" style={{ height: `${Math.max(4, (bar.value / maxBarValue) * 100)}%` }} />
                <span className="text-xs bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-1 rounded-2xl overflow-hidden p-6 flex flex-col animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '150ms' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Active Sessions</h2>
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <span className="text-6xl font-bold gradient-text tabular-nums">{data.activeSessions.toLocaleString()}</span>
            <span className="mt-2 text-sm text-emerald-400">estimated live sessions</span>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-cyan-400">tokens valid &amp; unrevoked</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '200ms' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Top Offending IPs</h2>
          </div>
          {data.failedLogins.byIp.length === 0 ? (
            <p className="p-6 text-sm text-cyan-400">No failed login activity recorded.</p>
          ) : (
            <table className="min-w-full">
              <thead style={{ background: 'rgba(11, 17, 32, 0.8)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">Failed Attempts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">Last Attempt</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                {data.failedLogins.byIp.map(row => (
                  <tr key={row.ip} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <td className="px-6 py-3 text-sm font-mono font-medium gradient-text">{row.ip}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 rounded-full overflow-hidden" style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                          <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-rose-500" style={{ width: `${Math.max(5, (row.count / data.failedLogins.byIp[0].count) * 100)}%` }} />
                        </div>
                        <span className="text-sm font-semibold gradient-text tabular-nums">{row.count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-violet-400 whitespace-nowrap">{formatDateTime(row.lastAttempt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '250ms' }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Suspicious Activity</h2>
            <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
              {data.suspiciousActivity.length} recent
            </span>
          </div>
          {data.suspiciousActivity.length === 0 ? (
            <p className="p-6 text-sm text-cyan-400">No suspicious events logged. All clear.</p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
              {data.suspiciousActivity.map(item => (
                <li key={item.id} className="px-6 py-3 hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SUSPICIOUS_BADGES[item.action] || "bg-white/5 text-cyan-400 border border-white/10"}`}>
                          <span className="gradient-text">{item.action}</span>
                        </span>
                        <span className="text-sm gradient-text truncate">{item.user ? item.user.name : "Unknown user"}</span>
                        {item.user && <span className="text-xs text-cyan-400 truncate">{item.user.email}</span>}
                      </div>
                      <p className="mt-1 text-xs text-violet-400 truncate">
                        {item.entityType} · {item.ipAddress || "unknown IP"}
                        {item.userAgent ? ` · ${item.userAgent.slice(0, 60)}` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-cyan-400 whitespace-nowrap">{relativeTime(item.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '300ms' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Security Recommendations</h2>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${TONE_STYLES[rec.tone]}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE_DOTS[rec.tone]}`} />
                <span className="text-sm text-cyan-400">{rec.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            {[
              { value: data.factors.failedLoginsToday, label: "Failed Logins Today", gradient: "from-red-500 to-pink-500" },
              { value: `${Math.round(data.factors.inactiveAccountRatio * 100)}%`, label: "Inactive Accounts", gradient: "from-amber-500 to-orange-500" },
              { value: data.factors.unresolvedHighRiskReports, label: "Unresolved High-Risk Reports", gradient: "from-violet-500 to-purple-500" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(11, 17, 32, 0.8)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.gradient}`} />
                <p className="text-lg font-bold gradient-text tabular-nums">{s.value}</p>
                <p className="text-xs bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
