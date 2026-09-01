'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface Category {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string | null;
  date: string;
  isRecurring: boolean;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formCategory, setFormCategory] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formIsRecurring, setFormIsRecurring] = useState(false);

  async function fetchExpenses() {
    try {
      const res = await apiClient.get<{ data: { data: Expense[] } }>('/api/budget/expenses?limit=100');
      setExpenses(Array.isArray(res.data?.data) ? res.data.data : []);
      setError(null);
    } catch {
      setError('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await apiClient.get<{ data: Category[] }>('/api/budget/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCategories([]);
    }
  }

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/api/budget/expenses', {
        categoryId: formCategory,
        amount: parseFloat(formAmount),
        description: formDescription,
        date: formDate,
        isRecurring: formIsRecurring,
      });
      await fetchExpenses();
      setShowForm(false);
      setFormAmount('');
      setFormDescription('');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormIsRecurring(false);
    } catch {
      setError('Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = expenses.filter((exp) => {
    if (filterStart && new Date(exp.date) < new Date(filterStart)) return false;
    if (filterEnd && new Date(exp.date) > new Date(filterEnd)) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/budget" className="text-blue-600 hover:text-blue-800 text-sm font-medium">&larr; Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Expenses</h1>
          <p className="text-gray-500 mt-1">Manage and track your expenses</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Expense'}</Button>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">From:</label>
          <input
            type="date"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            className="input-field px-3 py-1.5"
          />
          <label className="text-sm text-gray-400">To:</label>
          <input
            type="date"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            className="input-field px-3 py-1.5"
          />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAddExpense} className="card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="input-field"
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="input-field"
                placeholder="What was this expense for?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formIsRecurring}
              onChange={(e) => setFormIsRecurring(e.target.checked)}
              className="rounded border-white/10 bg-white/5"
            />
            <label htmlFor="isRecurring" className="text-sm text-gray-300">Recurring expense</label>
          </div>
          <Button type="submit" isLoading={submitting}>Save Expense</Button>
        </form>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No expenses found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Description</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((expense) => (
                <tr key={expense.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-200 capitalize">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-100">{expense.description || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">${expense.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
