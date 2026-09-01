'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Deadline {
  id: string;
  title: string;
  description?: string;
  deadlineDate: string;
  deadlineType: string;
  sourceType?: string;
  sourceId?: string;
  isVerified: boolean;
  status: string;
  reminderDaysBefore: number;
}

interface DeadlineTypeConfig {
  value: string;
  label: string;
  color: string;
}

const DEADLINE_TYPES: DeadlineTypeConfig[] = [
  { value: 'scholarship', label: 'Scholarship', color: 'bg-purple-500/10 text-purple-400' },
  { value: 'university', label: 'University', color: 'bg-blue-500/10 text-blue-400' },
  { value: 'application', label: 'Application', color: 'bg-indigo-500/10 text-indigo-400' },
  { value: 'study', label: 'Study', color: 'bg-green-500/10 text-green-400' },
  { value: 'budget', label: 'Budget', color: 'bg-amber-500/10 text-amber-400' },
];

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadlineDate: '',
    deadlineType: DEADLINE_TYPES[0].value,
    reminderDaysBefore: '7',
    sourceType: '',
    sourceId: '',
  });

  const fetchDeadlines = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`/api/notifications/deadlines?type=${typeFilter}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDeadlines(data.data || []);
      }
    } catch {
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/notifications/deadlines', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          deadlineDate: form.deadlineDate,
          deadlineType: form.deadlineType,
          reminderDaysBefore: parseInt(form.reminderDaysBefore, 10) || 7,
          sourceType: form.sourceType || undefined,
          sourceId: form.sourceId || undefined,
        }),
      });
      if (res.ok) {
        setSuccessMsg('Deadline created successfully');
        setShowForm(false);
        setForm({
          title: '',
          description: '',
          deadlineDate: '',
          deadlineType: DEADLINE_TYPES[0].value,
          reminderDaysBefore: '7',
          sourceType: '',
          sourceId: '',
        });
        await fetchDeadlines();
      } else {
        setSuccessMsg('Failed to create deadline');
      }
    } catch {
      setSuccessMsg('Failed to create deadline');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/notifications/deadlines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccessMsg('Deadline deleted');
        await fetchDeadlines();
      }
    } catch {
      setSuccessMsg('Failed to delete deadline');
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/notifications/deadlines/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.ok) {
        setSuccessMsg('Deadline marked as completed');
        await fetchDeadlines();
      }
    } catch {
      setSuccessMsg('Failed to update deadline');
    }
  };

  const getDaysUntil = (deadlineDate: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const date = new Date(deadlineDate);
    date.setHours(0, 0, 0, 0);
    return Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (deadline: Deadline) => {
    const days = getDaysUntil(deadline.deadlineDate);
    if (deadline.status === 'completed') {
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">Completed</span>;
    }
    if (days < 0) {
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">Passed</span>;
    }
    if (days <= 3) {
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/10 text-orange-400">Urgent</span>;
    }
    if (days <= 14) {
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400">Approaching</span>;
    }
    return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">Upcoming</span>;
  };

  const getTypeBadge = (type: string) => {
    const config = DEADLINE_TYPES.find((t) => t.value === type);
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config ? config.color : 'bg-white/5 text-gray-300'}`}>
        {config ? config.label : type}
      </span>
    );
  };

  const getVerificationBadge = (isVerified: boolean) =>
    isVerified ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-green-600">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Verified
      </span>
    ) : (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-gray-500">Unverified</span>
    );

  const formatDaysUntil = (days: number) => {
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Manage Deadlines</h1>
          <p className="text-sm text-gray-500 mt-1">Track scholarship, university, study and budget deadlines</p>
        </div>
        <div className="flex gap-2">
          <Link href="/notifications" className="px-4 py-2 btn-secondary">&larr; Back</Link>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            {showForm ? 'Cancel' : 'New Deadline'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">{successMsg}</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTypeFilter('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${typeFilter === '' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          All
        </button>
        {DEADLINE_TYPES.map((t) => (
          <button key={t.value} onClick={() => setTypeFilter(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${typeFilter === t.value ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full input-field"
                placeholder="e.g. Fulbright Scholarship Application"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Deadline Date *</label>
              <input
                type="date"
                required
                value={form.deadlineDate}
                onChange={(e) => setForm({ ...form, deadlineDate: e.target.value })}
                className="w-full input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Deadline Type *</label>
              <select
                value={form.deadlineType}
                onChange={(e) => setForm({ ...form, deadlineType: e.target.value })}
                className="w-full input-field"
              >
                {DEADLINE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Remind Me (days before)</label>
              <input
                type="number"
                min="0"
                value={form.reminderDaysBefore}
                onChange={(e) => setForm({ ...form, reminderDaysBefore: e.target.value })}
                className="w-full input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Source Type</label>
              <input
                type="text"
                value={form.sourceType}
                onChange={(e) => setForm({ ...form, sourceType: e.target.value })}
                className="w-full input-field"
                placeholder="e.g. scholarship, university, manual"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Source ID</label>
              <input
                type="text"
                value={form.sourceId}
                onChange={(e) => setForm({ ...form, sourceId: e.target.value })}
                className="w-full input-field"
                placeholder="Related record ID (optional)"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full input-field"
              placeholder="Additional details about this deadline"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Create Deadline
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : deadlines.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">No deadlines found</div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((d) => {
            const days = getDaysUntil(d.deadlineDate);
            return (
              <div key={d.id} className="card p-4 flex items-start justify-between hover:bg-white/5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-medium ${d.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-100'}`}>{d.title}</h3>
                    {getTypeBadge(d.deadlineType)}
                    {getStatusBadge(d)}
                    {getVerificationBadge(d.isVerified)}
                  </div>
                  {d.description && <p className="text-sm text-gray-400 mt-1">{d.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Due {new Date(d.deadlineDate).toLocaleDateString()}</span>
                    <span>{formatDaysUntil(days)}</span>
                    {d.sourceType && <span className="capitalize">Source: {d.sourceType.replace(/_/g, ' ')}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 whitespace-nowrap">
                  {d.status !== 'completed' && (
                    <button onClick={() => handleMarkComplete(d.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                      Complete
                    </button>
                  )}
                  <button onClick={() => handleDelete(d.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
