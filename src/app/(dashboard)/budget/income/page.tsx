'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

const FREQUENCIES = [
  { value: 'one_time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface IncomeRecord {
  id: string;
  source: string;
  amount: number;
  frequency: string;
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formSource, setFormSource] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formFrequency, setFormFrequency] = useState('monthly');

  async function fetchIncome() {
    try {
      const res = await apiClient.get<{ data: IncomeRecord[] }>('/api/budget/income');
      setIncomes(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch {
      setError('Failed to load income data');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchIncome();
  }, []);

  async function handleAddIncome(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/api/budget/income', {
        source: formSource,
        amount: parseFloat(formAmount),
        frequency: formFrequency,
      });
      await fetchIncome();
      setShowForm(false);
      setFormSource('');
      setFormAmount('');
      setFormFrequency('monthly');
    } catch {
      setError('Failed to add income');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/budget" className="text-blue-600 hover:text-blue-800 text-sm font-medium">&larr; Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Income</h1>
          <p className="text-gray-500 mt-1">Manage your income sources</p>
        </div>
      </div>

      <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Income'}</Button>

      {showForm && (
        <form onSubmit={handleAddIncome} className="card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Source</label>
              <input
                type="text"
                required
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="input-field"
                placeholder="e.g. Salary, Freelance"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Frequency</label>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value)}
                className="input-field"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" isLoading={submitting}>Save Income</Button>
        </form>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : incomes.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No income records found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Frequency</th>
                <th className="text-right px-4 py-3 font-medium text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {incomes.map((income) => (
                <tr key={income.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-gray-100 font-medium">{income.source}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 capitalize">
                      {income.frequency}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">${income.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
