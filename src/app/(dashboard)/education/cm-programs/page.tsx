'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface CMProgram {
  id: string;
  name: string;
  province: string;
  category: string;
  description: string;
  eligibility: string;
  benefits: string;
  howToApply: string;
  deadline: string | null;
  targetAudience: string;
  status: string;
}

const categoryLabels: Record<string, string> = {
  scholarship: 'Scholarship',
  laptop: 'Laptop Scheme',
  internship: 'Internship',
  health: 'Health',
  housing: 'Housing',
  skill: 'Skills Training',
  financial_aid: 'Financial Aid',
};

const categoryColors: Record<string, string> = {
  scholarship: 'bg-emerald-500/10 text-emerald-400',
  laptop: 'bg-purple-500/10 text-purple-400',
  internship: 'bg-green-500/10 text-green-400',
  health: 'bg-red-500/10 text-red-400',
  housing: 'bg-amber-500/10 text-amber-400',
  skill: 'bg-teal-500/10 text-teal-400',
  financial_aid: 'bg-yellow-500/10 text-yellow-400',
};

const provinceColors: Record<string, string> = {
  Punjab: 'bg-red-500/10 text-red-700',
  Sindh: 'bg-emerald-500/10 text-green-700',
  KPK: 'bg-emerald-500/10 text-emerald-700',
  Balochistan: 'bg-amber-500/10 text-amber-700',
  Islamabad: 'bg-purple-500/10 text-purple-700',
};

export default function CMProgramsPage() {
  const [programs, setPrograms] = useState<CMProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [province, setProvince] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (province) params.set('province', province);
    if (category) params.set('category', category);

    apiClient.get<{ data: { programs: CMProgram[]; pagination: typeof pagination } }>(`/api/education/cm-programs?${params}`)
      .then((res) => {
        setPrograms(res.data.programs);
        setPagination(res.data.pagination);
      })
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, [province, category, page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <a href="/education" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Education Center
        </a>
        <h1 className="text-2xl font-bold gradient-text">Chief Minister Programs</h1>
        <p className="text-emerald-400 mt-1">Government programs and schemes for all Pakistan provinces</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-3">What Are CM Programs?</h2>
        <p className="text-sm text-emerald-400 leading-relaxed">
          Chief Minister (CM) programs are provincial government initiatives designed to help citizens with education,
          healthcare, housing, employment, and financial assistance. Each province (Punjab, Sindh, KPK, Balochistan)
          runs its own programs tailored to local needs. These programs provide scholarships, laptops, internships,
          health insurance, housing, and skill development opportunities — all <strong>free of cost</strong>.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={province} onChange={(e) => { setProvince(e.target.value); setPage(1); }} className="input-field text-sm">
          <option value="">All Provinces</option>
          {['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-field text-sm">
          <option value="">All Categories</option>
          {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 card animate-pulse" />)}
        </div>
      ) : programs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-emerald-400">No programs found matching your filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-violet-400"><span className="font-semibold text-emerald-400">{pagination.total}</span> programs found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((p) => (
              <div key={p.id} className="card-hover cursor-pointer" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent text-sm">{p.name}</h3>
                  <div className="flex gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[p.category] || 'bg-white/5 text-emerald-400'}`}>
                      {categoryLabels[p.category] || p.category}
                    </span>
                  </div>
                </div>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${provinceColors[p.province] || 'bg-white/5 text-emerald-400'}`}>
                  {p.province}
                </span>
                <p className="text-xs text-emerald-400 mt-2 line-clamp-2">{p.description}</p>

                {expandedId === p.id && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-400 uppercase">Eligibility</h4>
                      <p className="text-sm text-emerald-400">{p.eligibility}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-violet-400 uppercase">Benefits</h4>
                      <p className="text-sm text-emerald-400">{p.benefits}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-400 uppercase">How to Apply</h4>
                      <p className="text-sm text-emerald-400">{p.howToApply}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-violet-400">
                      <span>Target: {p.targetAudience}</span>
                      <span className={`px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-500/10 text-green-400' : p.status === 'upcoming' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </div>
                    {p.deadline && (
                      <p className="text-xs text-orange-600">Deadline: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm disabled:opacity-40">Prev</button>
              <span className="text-sm text-emerald-400">Page {page} of {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
