'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { VerificationBadge } from '@/components/ui/verification-badge';

interface SchemeRequirement {
  requirementType: string;
  requirementValue: string;
  isRequired: boolean;
}

interface Scheme {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  eligibilityCriteria: string;
  deadline: string;
  amount: number;
  currency: string;
  province: string;
  targetAudience: string;
  status: string;
  verificationStatus: string;
  requirements: SchemeRequirement[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const categoryLabels: Record<string, string> = {
  scholarship: 'Scholarship',
  loan: 'Youth Loan',
  training: 'Training Program',
  stipend: 'Stipend',
  housing: 'Housing',
  digital: 'Digital/Laptop',
  financial_aid: 'Financial Aid',
  sports: 'Sports',
  health: 'Health',
};

const categoryColors: Record<string, string> = {
  scholarship: 'bg-blue-500/10 text-blue-400',
  loan: 'bg-green-500/10 text-green-400',
  training: 'bg-purple-500/10 text-purple-400',
  stipend: 'bg-yellow-500/10 text-yellow-400',
  housing: 'bg-orange-500/10 text-orange-400',
  digital: 'bg-cyan-500/10 text-cyan-400',
  financial_aid: 'bg-pink-500/10 text-pink-400',
  sports: 'bg-red-500/10 text-red-400',
  health: 'bg-emerald-500/10 text-emerald-400',
};

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [province, setProvince] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setError('');
    const reqId = ++requestIdRef.current;
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (category) params.set('category', category);
      if (province) params.set('province', province);
      params.set('page', String(page));
      params.set('limit', '20');
      const res = await apiClient.get<{ data: { schemes: Scheme[]; pagination: Pagination } }>(`/api/education/schemes?${params}`);
      if (reqId !== requestIdRef.current) return;
      setSchemes(res.data.schemes);
      setPagination(res.data.pagination);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setSchemes([]);
      setError(err instanceof Error ? err.message : 'Failed to load schemes');
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, [keyword, category, province, page]);

  useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/education" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Education Center
        </Link>
        <h1 className="text-2xl font-bold text-gray-100">Government Schemes for Students</h1>
        <p className="text-gray-500 mt-1">Explore scholarships, loans, training programs, and financial aid from Pakistani government</p>
      </div>

      <form onSubmit={handleSearch} className="card space-y-4">
        <input
          type="text"
          placeholder="Search schemes (e.g. Ehsaas, scholarship, loan...)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="input-field"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Categories</option>
            <option value="scholarship">Scholarship</option>
            <option value="loan">Youth Loan</option>
            <option value="training">Training Program</option>
            <option value="stipend">Stipend</option>
            <option value="housing">Housing</option>
            <option value="digital">Digital/Laptop</option>
            <option value="financial_aid">Financial Aid</option>
            <option value="sports">Sports</option>
            <option value="health">Health</option>
          </select>
          <select value={province} onChange={(e) => { setProvince(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Provinces</option>
            <option value="all">All Pakistan</option>
            <option value="punjab">Punjab</option>
            <option value="sindh">Sindh</option>
            <option value="kpk">KPK</option>
            <option value="balochistan">Balochistan</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {error && (
        <div className="card bg-red-500/10 border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-5 skeleton rounded w-3/4" />
              <div className="h-4 skeleton rounded w-1/2" />
              <div className="h-4 skeleton rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No schemes found. Try adjusting your search filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{pagination.total} schemes found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((s) => {
              const daysLeft = s.deadline ? Math.ceil((new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
              const urgent = daysLeft !== null && daysLeft <= 14;
              return (
                <Link key={s.id} href={`/education/schemes/${s.id}`} className="card-hover">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-100">{s.name}</h3>
                    <VerificationBadge status={s.verificationStatus === 'verified' ? 'verified' : 'unverified'} compact />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{s.provider}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[s.category] || 'bg-white/5 text-gray-300'}`}>
                      {categoryLabels[s.category] || s.category}
                    </span>
                    {s.province && s.province !== 'all' && (
                      <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full capitalize">{s.province}</span>
                    )}
                    {s.province === 'all' && (
                      <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">All Pakistan</span>
                    )}
                  </div>
                  {s.amount > 0 && (
                    <p className="text-sm font-medium text-green-400 mt-2">
                      {s.currency} {Number(s.amount).toLocaleString()}
                    </p>
                  )}
                  {s.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.requirements.slice(0, 3).map((r, i) => (
                        <span key={i} className="text-xs bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full">{r.requirementType}</span>
                      ))}
                      {s.requirements.length > 3 && (
                        <span className="text-xs text-gray-500">+{s.requirements.length - 3} more</span>
                      )}
                    </div>
                  )}
                  {daysLeft !== null && (
                    <div className="mt-2">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${urgent ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {daysLeft <= 0 ? 'Application deadline passed' : daysLeft <= 90 ? `Application: ${daysLeft} days left` : `Application deadline: ${new Date(s.deadline!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </span>
                      {daysLeft > 90 && (
                        <span className="inline-block text-xs text-gray-500 ml-2">(estimated)</span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm disabled:opacity-40">Prev</button>
              <span className="text-sm text-gray-400">Page {page} of {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
