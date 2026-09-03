"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  conversationCount: number;
  messageCount: number;
}

interface UsersListData {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsersResponse {
  success: boolean;
  data: UsersListData;
}

interface DetailUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string | null;
  country?: string | null;
  emailVerified?: boolean;
  lastLoginAt?: string | null;
}

interface RecentActivityItem {
  type: "conversation" | "message";
  id: string;
  title?: string;
  status?: string;
  conversationId?: string;
  role?: string;
  preview?: string;
  createdAt: string;
}

interface UserDetail {
  user: DetailUser;
  stats: {
    conversationCount: number;
    messageCount: number;
    documentCount: number;
    fraudReportCount: number;
  };
  recentActivity: RecentActivityItem[];
}

interface DetailResponse {
  success: boolean;
  data: UserDetail;
}

type RoleFilter = "" | "user" | "teacher" | "admin";
type StatusFilter = "" | "active" | "banned";
type SortField = "createdAt" | "name" | "email" | "lastLogin";

const PAGE_SIZE = 10;

const inputClass =
  "w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-0 outline-none transition-all duration-200";

const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent";

const thClass =
  "px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap";

const ROLE_BADGES: Record<string, string> = {
  admin: "bg-gradient-to-r from-violet-500/15 to-purple-500/15 text-violet-400 border border-violet-500/30",
  teacher: "bg-gradient-to-r from-emerald-500/15 to-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  user: "bg-white/5 text-emerald-400 border border-white/10",
};

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "createdAt", label: "Created date" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "lastLogin", label: "Last login" },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        ROLE_BADGES[role] ?? "bg-white/5 text-emerald-400 border-white/10"
      }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500 shadow-emerald-500/30 shadow" : "bg-red-400 shadow-red-500/30 shadow"}`}
      />
      <span className={`text-xs font-semibold ${active ? "text-emerald-400" : "text-red-400"}`}>
        {active ? "Active" : "Banned"}
      </span>
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 text-xs font-bold text-white shadow-sm">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ReasonField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={`${id}-reason`} className={labelClass}>
        Reason *
      </label>
      <textarea
        id={`${id}-reason`}
        required
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Explain why this action is being taken..."
        className={`${inputClass} w-full resize-none`}
      />
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 card p-6 shadow-2xl animate-scale-in">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-base font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-emerald-400 transition-colors hover:bg-white/5 hover:text-emerald-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
  danger,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  danger?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        danger ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gradient-to-r from-indigo-600 to-teal-400 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
      }`}
    >
      {children}
    </button>
  );
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-xl border-2 border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-white/5 hover:border-white/10 active:scale-[0.98]"
    >
      Cancel
    </button>
  );
}

function RoleModal({
  user,
  onClose,
  onDone,
}: {
  user: UserListItem;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [role, setRole] = useState(user.role === "admin" ? "teacher" : "admin");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiClient.patch(`/api/admin/system/users/${user.id}`, { role, reason });
      onDone(`Role for ${user.email} changed to ${role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Change role — ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="role-select" className={labelClass}>
            New Role
          </label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`${inputClass} w-full capitalize`}
          >
            {["user", "teacher", "admin"].map((r) => (
              <option key={r} value={r} disabled={r === user.role}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
                {r === user.role ? " (current)" : ""}
              </option>
            ))}
          </select>
        </div>
        <ReasonField id="role" value={reason} onChange={setReason} />
        {error ? (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        ) : null}
        <div className="flex gap-3 pt-1">
          <PrimaryButton type="submit" disabled={saving || !reason.trim()}>
            {saving ? "Saving..." : "Confirm Change"}
          </PrimaryButton>
          <CancelButton onClick={onClose} />
        </div>
      </form>
    </ModalShell>
  );
}

function BanModal({
  user,
  onClose,
  onDone,
}: {
  user: UserListItem;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const banning = user.isActive;
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiClient.post(`/api/admin/system/users/${user.id}/toggle`, { reason });
      onDone(banning ? `${user.email} has been banned` : `${user.email} has been unbanned`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`${banning ? "Ban" : "Unban"} — ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            banning
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {banning
            ? "Banning this user will immediately revoke their access to the platform."
            : "Unbanning this user will restore their access to the platform."}
        </p>
        <ReasonField id="ban" value={reason} onChange={setReason} />
        {error ? (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        ) : null}
        <div className="flex gap-3 pt-1">
          <PrimaryButton type="submit" danger={banning} disabled={saving || !reason.trim()}>
            {saving ? "Working..." : banning ? "Confirm Ban" : "Confirm Unban"}
          </PrimaryButton>
          <CancelButton onClick={onClose} />
        </div>
      </form>
    </ModalShell>
  );
}

function DeleteModal({
  user,
  onClose,
  onDone,
}: {
  user: UserListItem;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setError(null);
    try {
      await apiClient.delete(`/api/admin/system/users/${user.id}`, { reason });
      onDone(`${user.email} has been deleted`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
      setDeleting(false);
    }
  };

  return (
    <ModalShell title={`Delete — ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
          <p className="text-sm font-semibold text-red-400">This action is permanent.</p>
          <p className="mt-1 text-xs text-red-500">
            All data belonging to {user.email} will be permanently removed and cannot be recovered.
          </p>
        </div>
        <div>
          <label htmlFor="delete-confirm" className={labelClass}>
            Type DELETE to confirm *
          </label>
          <input
            id="delete-confirm"
            type="text"
            required
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className={inputClass}
          />
        </div>
        <ReasonField id="delete" value={reason} onChange={setReason} />
        {error ? (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        ) : null}
        <div className="flex gap-3 pt-1">
          <PrimaryButton
            type="submit"
            danger
            disabled={deleting || !reason.trim() || confirmText !== "DELETE"}
          >
            {deleting ? "Deleting..." : "Delete Permanently"}
          </PrimaryButton>
          <CancelButton onClick={onClose} />
        </div>
      </form>
    </ModalShell>
  );
}

function DetailPanel({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);
    apiClient
      .get<DetailResponse>(`/api/admin/system/users/${userId}`)
      .then((res) => {
        if (!cancelled) setDetail(res.data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load user details");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const statItems = detail
    ? [
        { label: "Conversations", value: detail.stats.conversationCount, gradient: "from-emerald-400 to-teal-400" },
        { label: "Messages", value: detail.stats.messageCount, gradient: "from-violet-400 to-purple-400" },
        { label: "Documents", value: detail.stats.documentCount, gradient: "from-emerald-400 to-teal-400" },
        { label: "Fraud Reports", value: detail.stats.fraudReportCount, gradient: "from-rose-400 to-red-400" },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Close panel" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 card shadow-2xl shadow-slate-900/10 animate-slide-up">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold gradient-text">User Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-emerald-400 transition-colors hover:bg-white/5 hover:text-emerald-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full skeleton" />
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded skeleton" />
                  <div className="h-3 w-52 rounded skeleton" />
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl skeleton" />
              ))}
            </div>
          ) : error || !detail ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-6 text-center text-sm text-red-400">
              {error ?? "No details available"}
            </p>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={detail.user.name} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold gradient-text">{detail.user.name}</p>
                  <p className="truncate text-sm text-emerald-400">{detail.user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <RoleBadge role={detail.user.role} />
                <StatusBadge active={detail.user.isActive} />
                {detail.user.emailVerified ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    Email verified
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                    Email unverified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {statItems.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <p className="text-xl font-bold gradient-text">{stat.value.toLocaleString()}</p>
                    <p className={`text-xs font-medium bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.label}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className={labelClass}>Account Info</h3>
                <dl className="divide-y divide-white/10 rounded-lg border border-white/10 bg-white/5 px-4">
                  {[
                    { label: "Country", value: detail.user.country || "—" },
                    { label: "Created", value: formatDate(detail.user.createdAt) },
                    { label: "Updated", value: formatDateTime(detail.user.updatedAt) },
                    {
                      label: "Last login",
                      value:
                        detail.user.lastLoginAt != null
                          ? formatDateTime(detail.user.lastLoginAt)
                          : "Never",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2.5">
                      <dt className="text-xs bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">{row.label}</dt>
                      <dd className="text-sm font-medium gradient-text">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h3 className={labelClass}>Recent Activity</h3>
                {detail.recentActivity.length === 0 ? (
                  <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-violet-400">
                    No recent activity
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {detail.recentActivity.map((item) => (
                      <li
                        key={`${item.type}-${item.id}`}
                        className="flex gap-3 rounded-lg border border-white/10 card p-3 transition-colors hover:bg-white/5"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            item.type === "conversation"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-violet-500/10 text-violet-400"
                          }`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d={
                                item.type === "conversation"
                                  ? "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              }
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium gradient-text">
                            {item.type === "conversation"
                              ? `Conversation · ${item.title}`
                              : `Message (${item.role})`}
                          </p>
                          {item.preview ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-emerald-400">{item.preview}</p>
                          ) : null}
                          <p className="mt-1 text-[11px] text-violet-400">
                            {formatDateTime(item.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function getPageRange(page: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  let start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [listData, setListData] = useState<UsersListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [roleTarget, setRoleTarget] = useState<UserListItem | null>(null);
  const [banTarget, setBanTarget] = useState<UserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        sortBy,
        sortOrder,
      });
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter === "active") params.set("isActive", "true");
      if (statusFilter === "banned") params.set("isActive", "false");
      const res = await apiClient.get<UsersResponse>(`/api/admin/system/users?${params.toString()}`);
      setListData(res.data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load users");
      setListData(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const applySearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const isSelf = (u: UserListItem): boolean => currentUser?.id === u.id;

  const users = listData?.users ?? [];
  const total = listData?.total ?? 0;
  const totalPages = listData?.totalPages ?? 1;
  const pageNumbers = getPageRange(page, totalPages);

  const actionButtonClass =
    "rounded-lg border border-white/10 card px-2.5 py-1 text-xs font-medium text-emerald-400 transition-colors hover:border-white/10 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="-m-6 min-h-screen p-6 text-gray-100 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight gradient-text">User Management</h1>
            <p className="mt-1 text-sm text-emerald-400">
              <span className="text-emerald-400">Search</span>, filter and administer{" "}
              <span className="text-violet-400">every account</span> on the platform
            </p>
          </div>
          <span className="rounded-full border border-white/10 card px-3 py-1 text-xs font-medium gradient-text shadow-sm">
            {total.toLocaleString()} total users
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 card p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applySearch();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or email..."
                  className={`${inputClass} w-full pl-9 sm:w-72`}
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                Search
              </button>
            </form>

            <div>
              <label htmlFor="filter-role" className={labelClass}>
                Role
              </label>
              <select
                id="filter-role"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as RoleFilter);
                  setPage(1);
                }}
                className={`${inputClass} capitalize`}
              >
                <option value="">All roles</option>
                <option value="user">User</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-status" className={labelClass}>
                Status
              </label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(1);
                }}
                className={inputClass}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort-field" className={labelClass}>
                Sort by
              </label>
              <select
                id="sort-field"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortField);
                  setPage(1);
                }}
                className={inputClass}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sort-order" className={labelClass}>
                Order
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as "asc" | "desc");
                  setPage(1);
                }}
                className={inputClass}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {toast ? (
          <div className="animate-fade-in rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {toast}
          </div>
        ) : null}

        {fetchError && !loading ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-6 text-center">
            <p className="text-sm text-red-400">{fetchError}</p>
            <button
              onClick={() => {
                setPage(1);
                setSearch("");
                setSearchInput("");
                setRoleFilter("");
                setStatusFilter("");
                setSortBy("createdAt");
                setSortOrder("desc");
              }}
              className="mt-3 rounded-xl border border-red-500/30 card px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              Reset filters & retry
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-2 rounded-2xl border border-white/10 card p-4 shadow-sm">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl px-4 py-3">
                <div className="h-8 w-8 rounded-full skeleton" />
                <div className="h-3 w-48 rounded skeleton" />
                <div className="ml-auto hidden h-3 w-64 rounded skeleton md:block" />
                <div className="hidden ml-auto h-3 w-32 rounded skeleton lg:block" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-white/10 card px-4 py-16 text-center shadow-sm">
            <p className="text-sm font-medium text-violet-400">No users found</p>
            <p className="mt-1 text-xs text-violet-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-white/10 card shadow-sm">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Role</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Created</th>
                    <th className={`${thClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-white/5">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium gradient-text">{u.name}</p>
                            <p className="text-[11px] text-violet-400">
                              {isSelf(u) ? "You" : u.lastLoginAt ? <><span className="text-emerald-400">Last seen </span><span className="text-violet-400">{formatDate(u.lastLoginAt)}</span></> : "Never logged in"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-emerald-400">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge active={u.isActive} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-violet-400">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setDetailUserId(u.id)}
                            className={`${actionButtonClass} hover:!border-emerald-500/50 hover:!text-emerald-400`}
                          >
                            View
                          </button>
                          <button
                            onClick={() => setRoleTarget(u)}
                            disabled={isSelf(u)}
                            title={isSelf(u) ? "You cannot change your own role" : "Change role"}
                            className={actionButtonClass}
                          >
                            Role
                          </button>
                          <button
                            onClick={() => setBanTarget(u)}
                            disabled={isSelf(u)}
                            title={isSelf(u) ? "You cannot ban your own account" : undefined}
                            className={`${actionButtonClass} ${u.isActive ? "hover:!border-amber-500/50 hover:!text-amber-400" : "hover:!border-emerald-500/50 hover:!text-emerald-400"}`}
                          >
                            {u.isActive ? "Ban" : "Unban"}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            disabled={isSelf(u)}
                            title={isSelf(u) ? "You cannot delete your own account" : "Delete user"}
                            className={`${actionButtonClass} hover:!border-red-500/50 hover:!text-red-400`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm gradient-text">
                Page {page} of {totalPages} · {total.toLocaleString()} users
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-xl border border-white/10 card px-3 py-1.5 text-sm font-medium gradient-text transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`min-w-[2rem] rounded-xl px-2.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      n === page
                        ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg shadow-indigo-500/25"
                        : "border border-white/10 card gradient-text hover:bg-white/5"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-xl border border-white/10 card px-3 py-1.5 text-sm font-medium gradient-text transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {detailUserId ? <DetailPanel userId={detailUserId} onClose={() => setDetailUserId(null)} /> : null}
      {roleTarget ? (
        <RoleModal
          user={roleTarget}
          onClose={() => setRoleTarget(null)}
          onDone={(msg) => {
            setRoleTarget(null);
            setToast(msg);
            fetchUsers();
          }}
        />
      ) : null}
      {banTarget ? (
        <BanModal
          user={banTarget}
          onClose={() => setBanTarget(null)}
          onDone={(msg) => {
            setBanTarget(null);
            setToast(msg);
            fetchUsers();
          }}
        />
      ) : null}
      {deleteTarget ? (
        <DeleteModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDone={(msg) => {
            setDeleteTarget(null);
            setDetailUserId((current) => (current === deleteTarget.id ? null : current));
            setToast(msg);
            if (page > 1 && total % PAGE_SIZE === 1) setPage(page - 1);
            else fetchUsers();
          }}
        />
      ) : null}
    </div>
  );
}
