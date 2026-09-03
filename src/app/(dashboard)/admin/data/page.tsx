"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface DashboardStats {
  universities: number;
  scholarships: number;
  sources: number;
  fraudRules: number;
  countries: number;
  changeLogs: number;
}

interface ListResult {
  total: number;
}

interface BackupFile {
  fileName: string;
  path: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
}

interface BackupList {
  directory: string;
  backups: BackupFile[];
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

const DATA_CARDS = [
  {
    label: "Universities",
    description: "Institution profiles and rankings",
    statKey: "universities" as const,
    iconPath:
      "M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z",
    iconClass: "bg-emerald-500/10 text-emerald-600",
    hoverClass: "hover:border-emerald-500/30 hover:bg-emerald-500/10",
    labelGradient: "bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent",
  },
  {
    label: "Scholarships",
    description: "Funding opportunities by country",
    statKey: "scholarships" as const,
    iconPath:
      "M12 15a7.5 7.5 0 007.5-7.5M12 15A7.5 7.5 0 014.5 7.5M12 15v6m-4 0h8m1.5-16.75l-5.25 3.5m0 0l-5.25-3.5M12 10.75a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5z",
    iconClass: "bg-emerald-500/10 text-emerald-600",
    hoverClass: "hover:border-emerald-500/30 hover:bg-emerald-500/10",
    labelGradient: "bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent",
  },
  {
    label: "Sources",
    description: "Cited references for data entries",
    statKey: "sources" as const,
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    iconClass: "bg-violet-500/10 text-violet-600",
    hoverClass: "hover:border-violet-500/30 hover:bg-violet-500/10",
    labelGradient: "bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent",
  },
  {
    label: "Fraud Rules",
    description: "Detection patterns and severity scores",
    statKey: "fraudRules" as const,
    iconPath:
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    iconClass: "bg-red-500/10 text-red-600",
    hoverClass: "hover:border-red-500/30 hover:bg-red-500/10",
    labelGradient: "bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent",
  },
  {
    label: "Countries",
    description: "Country profiles for study abroad",
    statKey: "countries" as const,
    iconPath:
      "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    iconClass: "bg-emerald-500/10 text-emerald-600",
    hoverClass: "hover:border-emerald-500/30 hover:bg-emerald-500/10",
    labelGradient: "bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent",
  },
  {
    label: "Visa Sources",
    description: "Official visa information per country",
    statKey: "visaSources" as const,
    iconPath:
      "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.984 3.984 0 00-3 1.38m8-1.42a2 2 0 100-4 2 2 0 000 4z",
    iconClass: "bg-amber-500/10 text-amber-600",
    hoverClass: "hover:border-amber-500/30 hover:bg-amber-500/10",
    labelGradient: "bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent",
  },
];

export default function DataManagementPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [visaSources, setVisaSources] = useState<number | null>(null);
  const [health, setHealth] = useState<{ verified: number; pending: number; unverified: number } | null>(null);
  const [backups, setBackups] = useState<BackupList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringFile, setRestoringFile] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const loadBackups = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiResponse<BackupList>>("/api/admin/system/backup");
      setBackups(res.data);
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : "Failed to load backups");
    }
  }, []);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [dashboardRes, visaRes, verifiedRes, pendingRes, unverifiedRes] = await Promise.all([
        apiClient.get<ApiResponse<DashboardStats>>("/api/admin/dashboard"),
        apiClient.get<ApiResponse<ListResult>>("/api/admin/visa-sources?limit=1"),
        apiClient.get<ApiResponse<ListResult>>("/api/admin/sources?limit=1&status=verified"),
        apiClient.get<ApiResponse<ListResult>>("/api/admin/sources?limit=1&status=pending"),
        apiClient.get<ApiResponse<ListResult>>("/api/admin/sources?limit=1&status=unverified"),
      ]);
      setStats(dashboardRes.data);
      setVisaSources(visaRes.data.total);
      setHealth({
        verified: verifiedRes.data.total,
        pending: pendingRes.data.total,
        unverified: unverifiedRes.data.total,
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data management overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadBackups();
  }, [loadData, loadBackups]);

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    setBackupMessage(null);
    setBackupError(null);
    try {
      await apiClient.post("/api/admin/system/backup");
      setBackupMessage("Backup created successfully.");
      await loadBackups();
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : "Failed to create backup");
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestore = async (backup: BackupFile) => {
    if (
      !window.confirm(
        `Restore database from "${backup.fileName}"? The current database will be replaced.`
      )
    ) {
      return;
    }
    setRestoringFile(backup.path);
    setBackupMessage(null);
    setBackupError(null);
    try {
      await apiClient.post("/api/admin/system/backup/restore", { backupPath: backup.path });
      setBackupMessage(`Database restored from ${backup.fileName}. Reloading data…`);
      await Promise.all([loadData(), loadBackups()]);
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : "Failed to restore backup");
    } finally {
      setRestoringFile(null);
    }
  };

  const getStatValue = (key: string): number | null => {
    if (!stats) return null;
    if (key === "visaSources") return visaSources;
    return (stats as unknown as Record<string, number>)[key] ?? null;
  };

  if (loading) {
    return (
      <div className="-m-4 min-h-screen bg-white/[0.03] p-4 text-gray-100 md:-m-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
          <div className="skeleton h-9 w-80" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-28" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-56" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats || !health) {
    return (
      <div className="-m-4 flex min-h-screen items-center justify-center bg-white/[0.03] p-4 text-gray-100 md:-m-6 md:p-8">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold gradient-text">Unable to load data overview</h1>
          <p className="mt-1 text-sm text-red-400">{error || "No data available."}</p>
          <button
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="btn-primary mt-6"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalEntries =
    stats.universities +
    stats.scholarships +
    stats.sources +
    stats.fraudRules +
    stats.countries +
    (visaSources ?? 0);
  const healthTotal = health.verified + health.pending + health.unverified;

  return (
    <div className="-m-4 min-h-screen bg-white/[0.03] p-4 text-gray-100 md:-m-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight gradient-text">Data Management</h1>
            <p className="mt-1 text-sm text-emerald-400">
              Central hub for every managed dataset in EduGuard
            </p>
          </div>
          <button onClick={loadData} className="btn-ghost">
            Refresh now
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Data Overview · click a card to manage
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {DATA_CARDS.map((card) => {
              const value = getStatValue(card.statKey);
              return (
                <Link
                  key={card.label}
                  href="/admin"
                  className={`group rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-sm transition-all duration-200 ${card.hoverClass}`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={card.iconPath} />
                      </svg>
                    </div>
                    <svg
                      className="h-4 w-4 text-emerald-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-emerald-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="mt-3 text-2xl font-bold tabular-nums leading-tight gradient-text">
                    {value === null ? "—" : formatNumber(value)}
                  </p>
                  <p className={`truncate text-xs font-medium ${card.labelGradient}`}>{card.label}</p>
                  <p className="mt-0.5 truncate text-[11px] text-emerald-400">{card.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">Quick Stats</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Total Data Entries</p>
                <p className="mt-1 text-3xl font-bold tabular-nums gradient-text">{formatNumber(totalEntries)}</p>
                <p className="mt-1 text-[11px] text-emerald-400">universities, scholarships, sources, rules & countries</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Tracked Changes</p>
                <p className="mt-1 text-3xl font-bold tabular-nums gradient-text">{formatNumber(stats.changeLogs)}</p>
                <p className="mt-1 text-[11px] text-emerald-400">recorded in the audit trail</p>
              </div>
            </div>
            <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-right text-xs">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Last updated{" "}</span>
              <span className="font-semibold gradient-text">
                {lastUpdated ? lastUpdated.toLocaleString() : "—"}
              </span>
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Data Health · Source Verification
            </h2>
            {healthTotal > 0 ? (
              <>
                <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(health.verified / healthTotal) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(health.pending / healthTotal) * 100}%` }}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${(health.unverified / healthTotal) * 100}%` }}
                  />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Verified sources
                    </span>
                    <span className="text-sm font-bold tabular-nums text-emerald-400">
                      {formatNumber(health.verified)} ({Math.round((health.verified / healthTotal) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      Pending review
                    </span>
                    <span className="text-sm font-bold tabular-nums text-amber-400">
                      {formatNumber(health.pending)} ({Math.round((health.pending / healthTotal) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      Unverified sources
                    </span>
                    <span className="text-sm font-bold tabular-nums text-red-400">
                      {formatNumber(health.unverified)} ({Math.round((health.unverified / healthTotal) * 100)}%)
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-emerald-400">
                No sources registered yet.
              </p>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Backup & Restore
              </h2>
              <p className="mt-0.5 text-xs text-emerald-400">
                SQLite snapshots{backups?.directory ? ` · ${backups.directory}` : ""}
              </p>
            </div>
            <button onClick={handleCreateBackup} disabled={creatingBackup} className="btn-primary">
              {creatingBackup ? "Creating backup…" : "Create Backup"}
            </button>
          </div>

          {backupMessage ? (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {backupMessage}
            </div>
          ) : null}
          {backupError ? (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {backupError}
            </div>
          ) : null}

          <div className="mt-4 divide-y divide-white/10 rounded-lg border border-white/10">
            {backups && backups.backups.length > 0 ? (
              backups.backups.map((backup) => (
                <div
                  key={backup.fileName}
                  className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.03] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium gradient-text">{backup.fileName}</p>
                    <p className="text-[11px] text-emerald-400">
                      {new Date(backup.createdAt).toLocaleString()} · {backup.sizeFormatted}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestore(backup)}
                    disabled={restoringFile !== null}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {restoringFile === backup.path ? "Restoring…" : "Restore"}
                  </button>
                </div>
              ))
            ) : (
              <p className="bg-white/[0.03] px-4 py-6 text-center text-sm text-emerald-400">
                No backups found yet. Create one to enable point-in-time restore.
              </p>
            )}
          </div>
        </section>

        {lastUpdated ? (
          <p className="text-right text-[11px] text-emerald-400">
            Counts refreshed {lastUpdated.toLocaleTimeString()}
          </p>
        ) : null}
      </div>
    </div>
  );
}
