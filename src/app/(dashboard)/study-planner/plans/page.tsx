'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface StudyPlan {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  schedule?: { tasks: { name: string; done: boolean }[] };
  createdAt: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      const res = await apiClient.get<{ data: StudyPlan[] }>('/api/study/plans');
      setPlans(res.data || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;

    setCreating(true);
    try {
      await apiClient.post('/api/study/plans', {
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setShowCreate(false);
      fetchPlans();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this plan?')) return;
    try {
      await apiClient.delete(`/api/study/plans/${id}`);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  }

  const now = new Date().toISOString();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/study-planner" className="text-sm text-blue-600 hover:underline">&larr; Back to Planner</Link>
          <h1 className="text-2xl font-bold text-gray-100 mt-1">Study Plans</h1>
          <p className="text-gray-500 mt-1">Create and manage your study plans</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showCreate ? 'Cancel' : '+ New Plan'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Create New Study Plan</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Plan Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Exam Prep, CSS History Revision"
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you planning to study?"
              rows={2}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : plans.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500">No study plans yet</p>
          <p className="text-sm text-gray-400 mt-1">Click &quot;+ New Plan&quot; to create your first study plan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => {
            const isActive = plan.status === 'active' && plan.endDate > now;
            const isCompleted = plan.status === 'completed';
            return (
              <div key={plan.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-100">{plan.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isCompleted ? 'bg-green-500/10 text-green-400' :
                        isActive ? 'bg-blue-500/10 text-blue-400' :
                        'bg-white/5 text-gray-400'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-gray-500 mb-2">{plan.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(plan.endDate).toLocaleDateString()}</span>
                    </div>
                    {plan.schedule?.tasks && plan.schedule.tasks.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {plan.schedule.tasks.slice(0, 5).map((task, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className={task.done ? 'text-green-500' : 'text-gray-300'}>
                              {task.done ? '✓' : '○'}
                            </span>
                            <span className={task.done ? 'text-gray-400 line-through' : 'text-gray-300'}>
                              {task.name}
                            </span>
                          </div>
                        ))}
                        {plan.schedule.tasks.length > 5 && (
                          <p className="text-xs text-gray-400">+{plan.schedule.tasks.length - 5} more tasks</p>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-gray-400 hover:text-red-500 text-sm ml-4"
                    title="Delete plan"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/study-planner/timer" className="card text-center hover:shadow-lg transition-shadow">
          <div className="text-2xl mb-2">⏱️</div>
          <p className="text-sm font-medium text-gray-100">Log Session</p>
        </Link>
        <Link href="/study-planner/topics" className="card text-center hover:shadow-lg transition-shadow">
          <div className="text-2xl mb-2">📅</div>
          <p className="text-sm font-medium text-gray-100">View Schedule</p>
        </Link>
        <Link href="/study-planner/performance" className="card text-center hover:shadow-lg transition-shadow">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm font-medium text-gray-100">Performance</p>
        </Link>
      </div>
    </div>
  );
}
