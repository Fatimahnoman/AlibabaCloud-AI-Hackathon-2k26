'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type CostCategory =
  | 'tuition'
  | 'application'
  | 'testing'
  | 'visa'
  | 'travel'
  | 'accommodation'
  | 'living'
  | 'insurance'
  | 'emergency'
  | 'other';

type CostVerificationStatus = 'verified' | 'estimated' | 'user_provided' | 'user_entered';

interface CostItem {
  id: string;
  category: CostCategory;
  label: string;
  description?: string;
  amount: number;
  verificationStatus: CostVerificationStatus;
  isRequired: boolean;
  quantity: number;
}

interface CostPlan {
  id: string;
  title: string;
  targetCountry?: string;
  targetUniversity?: string;
  studyLevel?: string;
  status?: string;
  currency: string;
  totalCost?: number;
  itemCount?: number;
  items?: CostItem[];
}

const CATEGORIES: CostCategory[] = [
  'tuition',
  'application',
  'testing',
  'visa',
  'travel',
  'accommodation',
  'living',
  'insurance',
  'emergency',
  'other',
];

const CATEGORY_COLORS: Record<CostCategory, string> = {
  tuition: 'bg-emerald-500/10 text-emerald-400',
  application: 'bg-purple-500/10 text-purple-400',
  testing: 'bg-indigo-500/10 text-indigo-400',
  visa: 'bg-pink-500/10 text-pink-400',
  travel: 'bg-orange-500/10 text-orange-400',
  accommodation: 'bg-teal-500/10 text-teal-400',
  living: 'bg-green-500/10 text-green-400',
  insurance: 'bg-emerald-500/10 text-emerald-400',
  emergency: 'bg-red-500/10 text-red-400',
  other: 'bg-white/5 text-gray-300',
};

const CATEGORY_BARS: Record<CostCategory, string> = {
  tuition: 'bg-emerald-500',
  application: 'bg-purple-500',
  testing: 'bg-indigo-500',
  visa: 'bg-pink-500',
  travel: 'bg-orange-500',
  accommodation: 'bg-teal-500',
  living: 'bg-green-500',
  insurance: 'bg-emerald-500',
  emergency: 'bg-red-500',
  other: 'bg-gray-500',
};

const VERIFICATION_BADGES: Record<string, { label: string; className: string }> = {
  verified: { label: '✓ VERIFIED', className: 'bg-green-500/10 text-green-400' },
  estimated: { label: '~ ESTIMATED', className: 'bg-yellow-500/10 text-yellow-400' },
  user_provided: { label: '● PROVIDED', className: 'bg-emerald-500/10 text-emerald-400' },
  user_entered: { label: '● PROVIDED', className: 'bg-emerald-500/10 text-emerald-400' },
};

const verificationBadge = (status: string) => VERIFICATION_BADGES[status] || VERIFICATION_BADGES.estimated;

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-white/5 text-gray-300',
  active: 'bg-emerald-500/10 text-emerald-400',
  completed: 'bg-green-500/10 text-green-400',
  archived: 'bg-yellow-500/10 text-yellow-400',
};

const STUDY_LEVELS = ["Bachelor's Degree", "Master's Degree", 'PhD', 'Diploma', 'Certificate'];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'PKR', 'INR', 'AED', 'TRY'];

const COUNTRIES = [
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'Italy', code: 'IT' },
  { name: 'Spain', code: 'ES' },
  { name: 'Turkey', code: 'TR' },
  { name: 'UAE', code: 'AE' },
  { name: 'Saudi Arabia', code: 'SA' },
  { name: 'Pakistan', code: 'PK' },
  { name: 'India', code: 'IN' },
  { name: 'Malaysia', code: 'MY' },
  { name: 'Japan', code: 'JP' },
  { name: 'China', code: 'CN' },
  { name: 'New Zealand', code: 'NZ' },
];

const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function CostPlannerPage() {
  const [plans, setPlans] = useState<CostPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CostPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    targetCountry: '',
    targetUniversity: '',
    studyLevel: '',
    currency: 'USD',
    notes: '',
  });
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    category: 'tuition' as CostCategory,
    label: '',
    amount: '',
    verificationStatus: 'estimated' as CostVerificationStatus,
    description: '',
    isRequired: true,
    quantity: '1',
  });
  const [autoPopulating, setAutoPopulating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/education/cost-plans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const basicPlans: CostPlan[] = Array.isArray(data.data) ? data.data : data.data?.plans || [];
        const enriched = await Promise.all(
          basicPlans.map(async (plan) => {
            try {
              const detailRes = await fetch(`/api/education/cost-plans/${plan.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!detailRes.ok) return plan;
              const detailData = await detailRes.json();
              return detailData.data?.plan ?? detailData.data ?? plan;
            } catch {
              return plan;
            }
          })
        );
        setPlans(enriched);
      }
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDetail = async (planId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/education/cost-plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedPlan(data.data?.plan ?? data.data);
      }
    } catch {
      setError('Failed to refresh plan');
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openPlan = async (planId: string) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/education/cost-plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to load plan');
      setSelectedPlan(data.data?.plan ?? data.data);
      setShowAddItem(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setSelectedPlan(null);
    setShowAddItem(false);
    setError('');
    setSuccessMsg('');
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/education/cost-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to create plan');
      setShowCreateForm(false);
      setForm({ title: '', targetCountry: '', targetUniversity: '', studyLevel: '', currency: 'USD', notes: '' });
      flashSuccess('Cost plan created successfully');
      await fetchPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/education/cost-plans/${selectedPlan.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          category: itemForm.category,
          label: itemForm.label,
          description: itemForm.description,
          amount: parseFloat(itemForm.amount) || 0,
          verificationStatus: itemForm.verificationStatus,
          isRequired: itemForm.isRequired,
          quantity: parseInt(itemForm.quantity, 10) || 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to add item');
      setShowAddItem(false);
      setItemForm({
        category: 'tuition',
        label: '',
        amount: '',
        verificationStatus: 'estimated',
        description: '',
        isRequired: true,
        quantity: '1',
      });
      flashSuccess('Cost item added');
      await Promise.all([refreshDetail(selectedPlan.id), fetchPlans()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedPlan) return;
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/education/cost-plans/${selectedPlan.id}/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      flashSuccess('Cost item removed');
      await Promise.all([refreshDetail(selectedPlan.id), fetchPlans()]);
    } catch {
      setError('Failed to delete item');
    }
  };

  const handleAutoPopulate = async () => {
    if (!selectedPlan) return;
    setAutoPopulating(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const countryCode = COUNTRIES.find((c) => c.name === selectedPlan.targetCountry)?.code || '';
      const res = await fetch(`/api/education/cost-plans/${selectedPlan.id}/auto-populate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ countryCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Auto-populate failed');
      const createdCount = typeof data.data === 'number' ? data.data : Number(data.data?.itemsCreated ?? 0);
      flashSuccess(
        createdCount > 0
          ? `Auto-populated ${createdCount} cost item${createdCount === 1 ? '' : 's'} from country data`
          : 'No additional cost items were added'
      );
      await Promise.all([refreshDetail(selectedPlan.id), fetchPlans()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auto-populate failed');
    } finally {
      setAutoPopulating(false);
    }
  };

  const items = selectedPlan?.items || [];
  const itemTotal = (item: CostItem) => (item.amount || 0) * (item.quantity || 1);
  const sumBy = (predicate: (item: CostItem) => boolean) =>
    items.filter(predicate).reduce((sum, item) => sum + itemTotal(item), 0);
  const totalCost = sumBy(() => true);
  const verifiedTotal = sumBy((item) => item.verificationStatus === 'verified');
  const estimatedTotal = sumBy((item) => item.verificationStatus === 'estimated');
  const userProvidedTotal = sumBy(
    (item) => item.verificationStatus === 'user_provided' || item.verificationStatus === 'user_entered'
  );
  const categoryTotals = CATEGORIES.map((category) => ({
    category,
    total: sumBy((item) => item.category === category),
  })).filter((entry) => entry.total > 0);
  const countryCode = selectedPlan ? COUNTRIES.find((c) => c.name === selectedPlan.targetCountry)?.code || '' : '';

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/education" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Education Center
      </Link>

      {successMsg && (
        <div className="rounded-lg border border-green-500/20 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm text-green-400">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!selectedPlan && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Financial Education Planner</h1>
              <p className="text-gray-500 mt-1">Calculate your total preparation cost for studying abroad</p>
            </div>
            <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
              {showCreateForm ? 'Cancel' : '+ New Cost Plan'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreatePlan} className="card space-y-4">
              <h2 className="text-lg font-semibold text-gray-100">Create Cost Plan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Plan Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Masters in Germany 2027"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Target Country</label>
                  <select
                    value={form.targetCountry}
                    onChange={(e) => setForm({ ...form, targetCountry: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Target University</label>
                  <input
                    type="text"
                    placeholder="e.g. TU Munich"
                    value={form.targetUniversity}
                    onChange={(e) => setForm({ ...form, targetUniversity: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Study Level</label>
                  <select
                    value={form.studyLevel}
                    onChange={(e) => setForm({ ...form, studyLevel: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select level</option>
                    {STUDY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="input-field"
                  >
                    {CURRENCIES.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="Optional notes about this plan"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
                {loading ? 'Creating...' : 'Create Plan'}
              </button>
            </form>
          )}

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Your Cost Plans</h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 card animate-pulse" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl">💰</span>
                <p className="text-gray-500 mt-3">No cost plans yet. Create your first plan to start budgeting.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const listTotal =
                    plan.items?.reduce((sum, item) => sum + (item.amount || 0) * (item.quantity || 1), 0) ??
                    plan.totalCost ??
                    0;
                  const listCount = plan.items?.length ?? plan.itemCount ?? 0;
                  return (
                    <button key={plan.id} onClick={() => openPlan(plan.id)} className="card-hover text-left">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-100">{plan.title}</h3>
                        {plan.status && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[plan.status] || STATUS_COLORS.draft}`}>
                            {capitalize(plan.status)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{plan.targetCountry || 'No country selected'}</p>
                      <div className="flex items-end justify-between mt-4">
                        <span className="text-xl font-bold text-gray-100">{formatMoney(listTotal, plan.currency)}</span>
                        <span className="text-xs text-gray-500">{listCount} items</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {selectedPlan && (
        <>
          <button onClick={goBack} className="text-sm text-gray-500 hover:text-gray-300">
            ← Back to all plans
          </button>

          <div className="card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-100">{selectedPlan.title}</h2>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {selectedPlan.targetCountry && (
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                      🌍 {selectedPlan.targetCountry}
                    </span>
                  )}
                  {selectedPlan.targetUniversity && (
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                      🏫 {selectedPlan.targetUniversity}
                    </span>
                  )}
                  {selectedPlan.studyLevel && (
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                      🎓 {selectedPlan.studyLevel}
                    </span>
                  )}
                  {selectedPlan.status && (
                    <span className={`px-3 py-1 rounded-full font-medium ${STATUS_COLORS[selectedPlan.status] || STATUS_COLORS.draft}`}>
                      {capitalize(selectedPlan.status)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleAutoPopulate}
                disabled={autoPopulating || !countryCode}
                title={countryCode ? `Auto-populate estimated costs for ${selectedPlan.targetCountry}` : 'Set a target country to auto-populate'}
                className="btn-secondary"
              >
                {autoPopulating ? 'Populating...' : '⚡ Auto-populate Costs'}
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-100 mb-4">Cost Summary</h3>
            <p className="text-4xl font-bold text-gray-100">{formatMoney(totalCost, selectedPlan.currency)}</p>
            <p className="text-sm text-gray-500 mt-1">
              Total preparation cost across {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400">
                ✓ VERIFIED {formatMoney(verifiedTotal, selectedPlan.currency)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400">
                ~ ESTIMATED {formatMoney(estimatedTotal, selectedPlan.currency)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                ● PROVIDED {formatMoney(userProvidedTotal, selectedPlan.currency)}
              </span>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-100 mb-4">Category Breakdown</h3>
            {categoryTotals.length === 0 ? (
              <p className="text-sm text-gray-500">No cost items yet. Add items or auto-populate to see the breakdown.</p>
            ) : (
              <div className="space-y-4">
                {categoryTotals.map(({ category, total }) => (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[category]}`}>
                        {category}
                      </span>
                      <span className="font-semibold text-gray-100">{formatMoney(total, selectedPlan.currency)}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CATEGORY_BARS[category]}`}
                        style={{ width: `${totalCost > 0 ? Math.round((total / totalCost) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-100">Cost Items ({items.length})</h3>
              <button onClick={() => setShowAddItem(!showAddItem)} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
                {showAddItem ? 'Cancel' : '+ Add Item'}
              </button>
            </div>

            {showAddItem && (
              <form onSubmit={handleAddItem} className="my-4 p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
                    <select
                      value={itemForm.category}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as CostCategory })}
                      className="input-field"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {capitalize(cat)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Label *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IELTS exam fee"
                      value={itemForm.label}
                      onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Amount *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={itemForm.amount}
                      onChange={(e) => setItemForm({ ...itemForm, amount: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Verification Status</label>
                    <select
                      value={itemForm.verificationStatus}
                      onChange={(e) => setItemForm({ ...itemForm, verificationStatus: e.target.value as CostVerificationStatus })}
                      className="input-field"
                    >
                      <option value="estimated">Estimated</option>
                      <option value="verified">Verified</option>
                      <option value="user_provided">User Provided</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={itemForm.quantity}
                      onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-gray-300 pb-2">
                      <input
                        type="checkbox"
                        checked={itemForm.isRequired}
                        onChange={(e) => setItemForm({ ...itemForm, isRequired: e.target.checked })}
                        className="rounded border-white/10"
                      />
                      Required cost
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="Optional details about this cost"
                      value={itemForm.description}
                      onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
                  {loading ? 'Adding...' : 'Add Item'}
                </button>
              </form>
            )}

            {items.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-3xl">🧾</span>
                <p className="text-sm text-gray-500 mt-2">No cost items in this plan yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-3 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other}`}>
                            {item.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold tracking-wide ${verificationBadge(item.verificationStatus).className}`}>
                            {verificationBadge(item.verificationStatus).label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isRequired ? 'bg-red-500/10 text-red-600' : 'bg-white/5 text-gray-500'}`}>
                            {item.isRequired ? 'Required' : 'Optional'}
                          </span>
                          {(item.quantity || 1) > 1 && (
                            <span className="text-xs font-medium text-gray-500">× {item.quantity}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-100 mt-1.5">{item.label}</p>
                        {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-100 whitespace-nowrap">
                          {formatMoney(itemTotal(item), selectedPlan.currency)}
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete item"
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
