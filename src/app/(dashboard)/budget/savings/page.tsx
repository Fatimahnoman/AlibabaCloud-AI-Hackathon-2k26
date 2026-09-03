'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  deadline?: string | null;
}

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState('$');

  const [formTitle, setFormTitle] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formMonthly, setFormMonthly] = useState('');
  const [formDeadline, setFormDeadline] = useState('');

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'PKR') return 'Rs ';
    if (cur === 'EUR') return '\u20ac';
    if (cur === 'GBP') return '\u00a3';
    if (cur === 'INR') return '\u20b9';
    return '$';
  };

  async function fetchGoals() {
    try {
      const [goalRes, profileRes] = await Promise.all([
        apiClient.get<{ data: SavingsGoal[] }>('/api/budget/savings'),
        apiClient.get<{ data: { profile: { currency: string } | null } }>('/api/budget'),
      ]);
      setGoals(Array.isArray(goalRes.data) ? goalRes.data : []);
      if (profileRes.data?.profile?.currency) {
        setCurrency(getCurrencySymbol(profileRes.data.profile.currency));
      }
      setError(null);
    } catch {
      setError('Failed to load savings goals');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchGoals();
  }, []);

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/api/budget/savings', {
        title: formTitle,
        targetAmount: parseFloat(formTarget),
        monthlyContribution: formMonthly ? parseFloat(formMonthly) : undefined,
        deadline: formDeadline || undefined,
      });
      await fetchGoals();
      setShowForm(false);
      setFormTitle('');
      setFormTarget('');
      setFormMonthly('');
      setFormDeadline('');
    } catch {
      setError('Failed to add savings goal');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/budget" className="text-emerald-500 hover:text-emerald-600 text-sm font-medium">&larr; Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Savings Goals</h1>
          <p className="text-gray-500 mt-1">Set targets and track your savings progress</p>
        </div>
      </div>

      <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Savings Goal'}</Button>

      {showForm && (
        <form onSubmit={handleAddGoal} className="card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Goal Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="input-field"
                placeholder="e.g. Emergency Fund"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Target Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Contribution ({currency})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formMonthly}
                onChange={(e) => setFormMonthly(e.target.value)}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
              <input
                type="date"
                required
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <Button type="submit" isLoading={submitting}>Save Goal</Button>
        </form>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : goals.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No savings goals yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <div key={goal.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-100">{goal.title}</h3>
                  <span className="text-sm font-medium text-emerald-500">{Math.min(progress, 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 mb-4">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Saved</span>
                    <span className="font-medium text-gray-100">{currency}{goal.currentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target</span>
                    <span className="font-medium text-gray-100">{currency}{goal.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monthly</span>
                    <span className="font-medium text-gray-100">{currency}{goal.monthlyContribution.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deadline</span>
                    <span className="font-medium text-gray-100">
                      {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
