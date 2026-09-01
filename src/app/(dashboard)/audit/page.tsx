"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface AuditEvent {
  _id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  userId?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ActionFilter = "" | "login" | "logout" | "verification" | "flag" | "update" | "create" | "delete";

const actionFilters: { value: ActionFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "verification", label: "Verification" },
  { value: "flag", label: "Flag" },
  { value: "update", label: "Update" },
  { value: "create", label: "Create" },
  { value: "delete", label: "Delete" },
];

const actionBadgeColors: Record<string, string> = {
  login: "bg-blue-100 text-blue-800",
  logout: "bg-white/5 text-gray-400",
  verification: "bg-green-100 text-green-800",
  flag: "bg-red-100 text-red-800",
  update: "bg-yellow-100 text-yellow-800",
  create: "bg-purple-100 text-purple-800",
  delete: "bg-red-100 text-red-800",
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<ActionFilter>("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set("action", actionFilter);
      params.set("page", String(pagination.page));

      const res = await apiClient.get<{ data: { logs: AuditEvent[]; pagination: Pagination } }>(
        `/api/audit?${params}`
      );
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, pagination.page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (value: ActionFilter) => {
    setActionFilter(value);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all system events and user actions</p>
        </div>
        <Link
          href="/verification"
          className="btn-secondary"
        >
          Back to Verification
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {actionFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              actionFilter === f.value
                ? "bg-blue-700 text-white"
                'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card p-6 animate-pulse space-y-3">
              <div className="h-4 skeleton rounded w-1/4" />
              <div className="h-4 skeleton rounded w-1/2" />
              <div className="h-4 skeleton rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No audit logs found for the selected filter.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{pagination.total} events found</p>
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          actionBadgeColors[log.action] || "bg-white/5 text-gray-400"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{log.entityType}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-[180px]">
                      {log.entityId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[300px] truncate">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="btn-secondary"
              >
                Prev
              </button>
              <span className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
