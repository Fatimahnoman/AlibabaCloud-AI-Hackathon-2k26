'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  priority: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  deadlineId?: string;
}

interface DeadlineResult {
  deadlineId: string;
  title: string;
  deadlineDate: string;
  daysUntil: number;
  urgency: string;
}

interface Dashboard {
  unreadCount: number;
  upcomingDeadlines: DeadlineResult[];
  recentNotifications: Notification[];
  stats: { totalDeadlines: number; upcoming: number; urgent: number; passed: number; completed: number };
}

export default function NotificationsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
      const [dashRes, notifRes] = await Promise.all([
        fetch('/api/notifications/dashboard', { headers }),
        fetch(`/api/notifications?unreadOnly=${filter === 'unread'}`, { headers }),
      ]);
      if (dashRes.ok) { const d = await dashRes.json(); setDashboard(d.data); }
      if (notifRes.ok) { const n = await notifRes.json(); setNotifications(n.data || []); }
    } catch { /* empty */ }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarkAsRead = async (id: string) => {
    const token = localStorage.getItem('accessToken');
    await fetch(`/api/notifications/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
    if (dashboard) setDashboard(prev => prev ? { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) } : prev);
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem('accessToken');
    await fetch('/api/notifications/read-all', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    if (dashboard) setDashboard(prev => prev ? { ...prev, unreadCount: 0 } : prev);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 border-l-4 border-red-500';
      case 'high': return 'bg-orange-500/10 border-l-4 border-orange-500';
      case 'normal': return 'bg-emerald-500/10 border-l-4 border-emerald-500';
      default: return 'bg-white/5 border-l-4 border-white/10';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">Critical</span>;
      case 'high': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/10 text-orange-400">High</span>;
      case 'medium': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400">Medium</span>;
      default: return <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-gray-400">Low</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading notifications...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <a href="/dashboard" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold text-gray-100">Notification Center</h1>
          <p className="text-sm text-gray-500 mt-1">Only verified deadlines generate notifications</p>
        </div>
        <div className="flex gap-2">
          <Link href="/notifications/deadlines" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Manage Deadlines</Link>
          {dashboard && dashboard.unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-secondary text-sm">Mark all read ({dashboard.unreadCount})</button>
          )}
        </div>
      </div>

      {dashboard && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Unread', value: dashboard.unreadCount, color: 'red' },
            { label: 'Upcoming', value: dashboard.stats.upcoming, color: 'blue' },
            { label: 'Urgent', value: dashboard.stats.urgent, color: 'orange' },
            { label: 'Passed', value: dashboard.stats.passed, color: 'gray' },
          ].map(s => (
            <div key={s.label} className="stat-card text-center">
              <div className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {dashboard && dashboard.upcomingDeadlines.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Upcoming Deadlines</h2>
          <div className="space-y-2">
            {dashboard.upcomingDeadlines.map(d => (
              <div key={d.deadlineId} className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5">
                <div>
                  <span className="font-medium">{d.title}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {d.daysUntil === 0 ? 'Today' : d.daysUntil === 1 ? 'Tomorrow' : `${d.daysUntil} days`}
                  </span>
                </div>
                {getUrgencyBadge(d.urgency)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {f === 'all' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="card text-center text-gray-400 p-8">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className={`rounded-lg p-4 ${n.isRead ? 'card' : getPriorityColor(n.priority)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                  <h3 className="font-medium text-sm">{n.title}</h3>
                </div>
                <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                  <span className="capitalize">{n.notificationType.replace(/_/g, ' ')}</span>
                </div>
              </div>
              {!n.isRead && (
                <button onClick={() => handleMarkAsRead(n.id)}
                  className="text-xs text-emerald-600 hover:text-emerald-800 ml-4 whitespace-nowrap">Mark read</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
