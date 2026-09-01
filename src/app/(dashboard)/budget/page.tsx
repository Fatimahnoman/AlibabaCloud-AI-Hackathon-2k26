'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import DepartmentChat from '@/components/department-chat/DepartmentChat';

interface BudgetProfile {
  monthlyIncome: number | null;
  currency: string;
  savingsGoal: number | null;
}

interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  categoryBreakdown: { category: string; amount: number }[];
}

interface ExpenseListItem {
  id: string;
  category: string;
  amount: number;
  description?: string | null;
  date: string;
}

interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: string;
}

interface BudgetPlanAllocation {
  category: string;
  amount: number;
  percentage: number;
  note?: string;
}

interface BudgetPlan {
  totalIncome: number;
  currency: string;
  allocations: BudgetPlanAllocation[];
  savings: { amount: number; percentage: number };
  summary: string;
  alerts?: string[];
}

export default function BudgetPage() {
  const [expenses, setExpenses] = useState<ExpenseListItem[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [budgetProfile, setBudgetProfile] = useState<BudgetProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupIncome, setSetupIncome] = useState('');
  const [setupCurrency, setSetupCurrency] = useState('PKR');
  const [setupGoal, setSetupGoal] = useState('');
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [budgetRes, expensesRes, incomeRes] = await Promise.all([
          apiClient.get<{ data: { profile: unknown; summary: BudgetSummary | null } }>('/api/budget'),
          apiClient.get<{ data: ExpenseListItem[] }>('/api/budget/expenses?limit=100'),
          apiClient.get<{ data: Income[] }>('/api/budget/income'),
        ]);

        setSummary(budgetRes.data?.summary ?? null);
        setBudgetProfile((budgetRes.data?.profile as BudgetProfile) ?? null);
        setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);
        setIncome(Array.isArray(incomeRes.data) ? incomeRes.data : []);
      } catch {
        setError('Failed to load budget data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const currencySymbol = budgetProfile?.currency === 'PKR' ? 'Rs ' :
    budgetProfile?.currency === 'EUR' ? '€' :
    budgetProfile?.currency === 'GBP' ? '£' :
    budgetProfile?.currency === 'INR' ? '₹' : '$';

  const totalIncome = summary?.totalIncome ?? income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = summary?.totalExpenses ?? expenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsRate =
    summary?.savingsRate ??
    (totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0);
  const categoryBreakdown: Record<string, number> = summary?.categoryBreakdown
    ? Object.fromEntries(summary.categoryBreakdown.map((entry) => [entry.category, entry.amount]))
    : expenses.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

  const maxCategoryAmount = Math.max(...Object.values(categoryBreakdown), 1);

  const handleMessageComplete = useCallback((content: string) => {
    const match = content.match(/```budget_plan\s*\n([\s\S]*?)```/);
    if (match) {
      try {
        const plan = JSON.parse(match[1].trim()) as BudgetPlan;
        if (plan.allocations && plan.allocations.length > 0) {
          setBudgetPlan(plan);
          setApplyResult(null);
        }
      } catch {
        // invalid JSON, ignore
      }
    }
  }, []);

  const handleApplyBudget = async () => {
    if (!budgetPlan) return;
    setIsApplying(true);
    setApplyResult(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/budget/ai-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          allocations: budgetPlan.allocations.map(a => ({
            category: a.category,
            amount: a.amount,
          })),
          period: 'monthly',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplyResult(data.data?.message || 'Budget applied successfully!');
      } else {
        setApplyResult(data.message || 'Failed to apply budget');
      }
    } catch {
      setApplyResult('Failed to apply budget. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSetupBudget = async () => {
    if (!setupIncome || parseFloat(setupIncome) <= 0) return;
    try {
      setError(null);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          monthlyIncome: parseFloat(setupIncome),
          currency: setupCurrency,
          savingsGoal: setupGoal ? parseFloat(setupGoal) : undefined,
        }),
      });
      if (res.ok) {
        setShowSetup(false);
        window.location.reload();
      } else {
        setError('Failed to create budget profile');
      }
    } catch {
      setError('Failed to create budget profile');
    }
  };

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold gradient-text">Smart Budget Dashboard</h1>
          <p className="text-sm mt-1 text-cyan-400"><span className="text-emerald-400 font-medium">Track</span> your <span className="text-green-400 font-medium">income</span>, <span className="text-red-400 font-medium">expenses</span>, and <span className="text-teal-400 font-medium">savings goals</span></p>
        </div>
        <div className="flex gap-2">
          {!budgetProfile && (
            <button onClick={() => setShowSetup(!showSetup)}
              className="px-4 py-2 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all">
              {showSetup ? 'Cancel' : 'Setup Budget'}
            </button>
          )}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              showChat
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
            }`}
          >
            {showChat ? 'Close AI' : '💰 Ask BudgetPro AI'}
          </button>
        </div>
      </div>

      {showSetup && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-8 animate-fade-in border border-emerald-500/20">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">⚙️</div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Quick Setup - Just 3 Steps!</h2>
            <p className="text-cyan-400 text-sm mt-1">Fill in your details below to start tracking</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-2">
                <span>💵</span> Monthly Income
              </label>
              <input type="number" value={setupIncome} onChange={e => setSetupIncome(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-base text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                style={{ background: 'rgba(11, 17, 32, 0.8)', border: '1.5px solid rgba(148, 163, 184, 0.15)' }}
                placeholder="e.g. 50000" />
              <p className="text-xs text-gray-500 mt-1">Your monthly salary/income</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-2">
                <span>🌍</span> Currency
              </label>
              <select value={setupCurrency} onChange={e => setSetupCurrency(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-base text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                style={{ background: 'rgba(11, 17, 32, 0.8)', border: '2px solid rgba(148, 163, 184, 0.15)' }}>
                <option value="PKR">🇵🇰 PKR — Pakistani Rupee</option>
                <option value="USD">🇺🇸 USD — US Dollar</option>
                <option value="EUR">🇪🇺 EUR — Euro</option>
                <option value="GBP">🇬🇧 GBP — British Pound</option>
                <option value="INR">🇮🇳 INR — Indian Rupee</option>
                <option value="AED">🇦🇪 AED — UAE Dirham</option>
                <option value="SAR">🇸🇦 SAR — Saudi Riyal</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Choose your currency</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-2">
                <span>🎯</span> Savings Goal <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <input type="number" value={setupGoal} onChange={e => setSetupGoal(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-base text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                style={{ background: 'rgba(11, 17, 32, 0.8)', border: '1.5px solid rgba(148, 163, 184, 0.15)' }}
                placeholder="e.g. 10000" />
              <p className="text-xs text-gray-500 mt-1">Monthly savings target</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSetupBudget}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105">
              ✅ Save & Start Tracking
            </button>
            <button onClick={() => setShowSetup(false)}
              className="px-6 py-3 rounded-xl font-semibold text-base bg-white/5 text-gray-300 hover:bg-white/10 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {!budgetProfile && !showSetup && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl shadow-xl p-10 text-center animate-fade-in border border-emerald-500/20">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-2xl font-bold gradient-text mb-3">Welcome to Smart Budget!</h3>
          <p className="text-cyan-400 text-base mb-6 max-w-md mx-auto">Track your income, expenses, and savings goals easily. Set up your budget in just 30 seconds!</p>
          <button onClick={() => setShowSetup(true)}
            className="px-8 py-3 rounded-xl font-semibold text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105">
            🚀 Get Started - It&apos;s Free!
          </button>
        </div>
      )}

      {showChat ? (
        <div className="space-y-4">
          <DepartmentChat
            department="budget"
            title="BudgetPro AI"
            subtitle="Smart budgeting & expense tracking expert"
            avatar="💰"
            avatarColor="bg-gradient-to-br from-purple-500 to-pink-500 text-white"
            onMessageComplete={handleMessageComplete}
            suggestions={[
              'Mera monthly budget banao, salary PKR 50,000 hai',
              'Student budget plan banao',
              'Family of 4 ka budget kaise banayein?',
              '50/30/20 rule kya hai?',
              'Savings kaise badhayein?',
              'Rent, utilities, groceries ka breakdown do',
            ]}
          />

          {budgetPlan && (
            <div className="bg-gradient-to-br from-emerald-500/[0.06] to-teal-500/[0.04] rounded-2xl shadow-xl border border-emerald-500/25 p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">AI Budget Plan</h3>
                    <p className="text-xs text-gray-500">{budgetPlan.summary}</p>
                  </div>
                </div>
                <button
                  onClick={handleApplyBudget}
                  disabled={isApplying}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isApplying
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-emerald-500/40 transform hover:scale-105'
                  }`}
                >
                  {isApplying ? '⏳ Applying...' : '✅ Apply This Budget'}
                </button>
              </div>

              {applyResult && (
                <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  applyResult.includes('success') || applyResult.includes('applied')
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  {applyResult}
                </div>
              )}

              {budgetPlan.alerts && budgetPlan.alerts.length > 0 && (
                <div className="mb-4 space-y-1.5">
                  {budgetPlan.alerts.map((alert, i) => (
                    <p key={i} className="text-xs text-amber-400">⚡ {alert}</p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {budgetPlan.allocations.map((alloc, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.06]">
                    <div>
                      <p className="text-sm font-medium gradient-text capitalize">{alloc.category}</p>
                      {alloc.note && <p className="text-[11px] text-gray-500 mt-0.5">{alloc.note}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold gradient-text">{budgetPlan.currency} {alloc.amount.toLocaleString()}</p>
                      <p className="text-[11px] text-gray-500">{alloc.percentage}%</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-emerald-500/[0.06] rounded-xl px-4 py-3 border border-emerald-500/20">
                  <div>
                    <p className="text-sm font-medium text-emerald-400 font-semibold">🎯 Savings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{budgetPlan.currency} {budgetPlan.savings.amount.toLocaleString()}</p>
                    <p className="text-[11px] text-emerald-400/70">{budgetPlan.savings.percentage}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-white/[0.06] pt-3">
                <span>Total Income: {budgetPlan.currency} {budgetPlan.totalIncome.toLocaleString()}</span>
                <button onClick={() => { setBudgetPlan(null); setApplyResult(null); }} className="text-gray-500 hover:text-red-400 transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl shadow-lg p-6 text-center border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-all">
              <div className="text-3xl mb-2">💵</div>
              <p className="text-xs bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide">Monthly Income</p>
              <p className="text-3xl font-bold gradient-text mt-2">{currencySymbol}{totalIncome.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Your total earnings</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl shadow-lg p-6 text-center border-2 border-red-500/30 hover:border-red-500/50 transition-all">
              <div className="text-3xl mb-2">💸</div>
              <p className="text-xs bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide">Monthly Expenses</p>
              <p className="text-3xl font-bold gradient-text mt-2">{currencySymbol}{totalExpenses.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Total spending</p>
            </div>
            <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl shadow-lg p-6 text-center border-2 border-teal-500/30 hover:border-teal-500/50 transition-all sm:col-span-2 lg:col-span-1">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-xs bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold uppercase tracking-wide">Savings Rate</p>
              <p className="text-3xl font-bold gradient-text mt-2">{savingsRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{savingsRate >= 20 ? '✅ Great!' : savingsRate >= 10 ? '👍 Good' : '⚠️ Improve'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">Category Breakdown</h2>
              {Object.keys(categoryBreakdown).length === 0 ? (
                <p className="text-cyan-400 text-sm">No expenses recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(categoryBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="gradient-text capitalize">{category}</span>
                          <span className="gradient-text font-medium">{currencySymbol}{amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(amount / maxCategoryAmount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent mb-4">Recent Expenses</h2>
              {recentExpenses.length === 0 ? (
                <p className="text-cyan-400 text-sm">No recent expenses</p>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <div>
                        <p className="text-sm font-medium gradient-text">{expense.description || expense.category}</p>
                        <p className="text-xs text-violet-400">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">-{currencySymbol}{expense.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <span>⚡</span> Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/budget/expenses" className="bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl shadow-lg p-5 text-center hover:shadow-xl hover:from-red-500/20 hover:to-rose-500/20 transition-all border-2 border-red-500/20 hover:border-red-500/40 group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">💸</div>
                <p className="text-sm font-bold gradient-text">Add Expense</p>
                <p className="text-xs text-gray-500 mt-1">Track spending</p>
              </Link>
              <Link href="/budget/income" className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl shadow-lg p-5 text-center hover:shadow-xl hover:from-emerald-500/20 hover:to-green-500/20 transition-all border-2 border-emerald-500/20 hover:border-emerald-500/40 group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">💰</div>
                <p className="text-sm font-bold gradient-text">Add Income</p>
                <p className="text-xs text-gray-500 mt-1">Record earnings</p>
              </Link>
              <Link href="/budget/savings" className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl shadow-lg p-5 text-center hover:shadow-xl hover:from-blue-500/20 hover:to-cyan-500/20 transition-all border-2 border-blue-500/20 hover:border-blue-500/40 group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎯</div>
                <p className="text-sm font-bold gradient-text">Savings Goals</p>
                <p className="text-xs text-gray-500 mt-1">Set targets</p>
              </Link>
              <Link href="/budget/savings" className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl shadow-lg p-5 text-center hover:shadow-xl hover:from-purple-500/20 hover:to-pink-500/20 transition-all border-2 border-purple-500/20 hover:border-purple-500/40 group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                <p className="text-sm font-bold gradient-text">Set Budget</p>
                <p className="text-xs text-gray-500 mt-1">Plan spending</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
