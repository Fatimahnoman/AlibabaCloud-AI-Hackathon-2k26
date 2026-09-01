'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import DepartmentChat from '@/components/department-chat/DepartmentChat';

interface Internship {
  id: string;
  title: string;
  organization: string;
  country: string;
  city: string | null;
  type: string;
  field: string;
  paidType: string;
  stipendAmount: string | null;
  duration: string;
  mode: string;
  eligibility: string;
  requirements: string;
  documentsRequired: string | null;
  benefits: string;
  applicationUrl: string | null;
  description: string | null;
  deadline: string | null;
}

const typeLabels: Record<string, string> = {
  internship: 'Internship',
  fellowship: 'Fellowship',
  house_job: 'House Job',
  clerkship: 'Clerkship',
  observership: 'Observership',
};

const typeColors: Record<string, string> = {
  internship: 'bg-blue-500/10 text-blue-400',
  fellowship: 'bg-purple-500/10 text-purple-400',
  house_job: 'bg-red-500/10 text-red-400',
  clerkship: 'bg-amber-500/10 text-amber-400',
  observership: 'bg-teal-500/10 text-teal-400',
};

const paidColors: Record<string, string> = {
  paid: 'bg-green-500/10 text-green-400',
  unpaid: 'bg-white/5 text-gray-400',
  stipend: 'bg-yellow-500/10 text-yellow-400',
  conditional: 'bg-orange-500/10 text-orange-400',
};

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('');
  const [type, setType] = useState('');
  const [field, setField] = useState('');
  const [paidType, setPaidType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showChat, setShowChat] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (country) params.set('country', country);
    if (type) params.set('type', type);
    if (field) params.set('field', field);
    if (paidType) params.set('paidType', paidType);

    apiClient.get<{ data: { internships: Internship[]; pagination: typeof pagination } }>(`/api/education/internships?${params}`)
      .then((res) => {
        setInternships(res.data.internships);
        setPagination(res.data.pagination);
      })
      .catch(() => setInternships([]))
      .finally(() => setLoading(false));
  }, [country, type, field, paidType, page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <a href="/education" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Education Center
            </a>
            <h1 className="text-2xl font-bold text-gray-100">Internships, Fellowships & House Jobs</h1>
            <p className="text-gray-500 mt-1">Find opportunities to gain real-world experience</p>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showChat ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {showChat ? 'Hide AI Assistant' : 'AI Internship Assistant'}
          </button>
        </div>
      </div>

      {showChat && (
        <DepartmentChat
          department="internships"
          title="InternshipExpert AI"
          subtitle="Complete internship & fellowship expert"
          avatar="\uD83D\uDCBC"
          avatarColor="bg-gradient-to-br from-rose-500 to-pink-600"
          noHistory
          freshStart
          suggestions={[
            'Pakistan mein kya internships available hain?',
            'CS field ki paid internships batao',
            'House job kaise milegi?',
            'Remote internships available hain?',
            'Stipend kitna milta hai internships mein?',
            'Fellowship aur internship mein kya farq hai?',
          ]}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <select value={country} onChange={(e) => { setCountry(e.target.value); setPage(1); }} className="input-field text-sm">
          <option value="">All Countries</option>
          {['Pakistan', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Remote'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="input-field text-sm">
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={field} onChange={(e) => { setField(e.target.value); setPage(1); }} className="input-field text-sm">
          <option value="">All Fields</option>
          {['medicine', 'computer_science', 'engineering', 'business', 'research', 'pharmacy', 'law'].map((f) => (
            <option key={f} value={f}>{f.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>
        <select value={paidType} onChange={(e) => { setPaidType(e.target.value); setPage(1); }} className="input-field text-sm">
          <option value="">All Payment</option>
          {['paid', 'unpaid', 'stipend', 'conditional'].map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 card animate-pulse" />)}
        </div>
      ) : internships.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No internships found matching your filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500"><span className="font-semibold text-gray-300">{pagination.total}</span> opportunities found</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {internships.map((i) => {
              const isExpanded = expandedId === i.id;
              return (
                <div key={i.id} className="card-hover p-0 overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-100 text-sm leading-tight">{i.title}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${typeColors[i.type] || 'bg-white/5 text-gray-400'}`}>
                            {typeLabels[i.type] || i.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            {i.organization}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {i.city ? `${i.city}, ` : ''}{i.country}
                          </span>
                        </div>
                      </div>
                      {i.deadline && (
                        <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg font-medium whitespace-nowrap shrink-0">
                          {new Date(i.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Tags Row */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${paidColors[i.paidType] || 'bg-white/5 text-gray-400'}`}>
                        {i.paidType === 'paid' ? '💰 Paid' : i.paidType === 'unpaid' ? 'Volunteer' : i.paidType === 'stipend' ? '🎯 Stipend' : 'Conditional'}
                      </span>
                      {i.stipendAmount && <span className="text-[10px] bg-emerald-500/10 text-green-400 px-2 py-0.5 rounded-full font-medium">{i.stipendAmount}</span>}
                      <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">⏱ {i.duration}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${i.mode === 'remote' ? 'bg-purple-500/10 text-purple-400' : i.mode === 'hybrid' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {i.mode === 'onsite' ? '🏢 On-site' : i.mode === 'remote' ? '🌍 Remote' : '🔄 Hybrid'}
                      </span>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full">
                        {i.field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>

                    {/* Description */}
                    {i.description && (
                      <p className="text-xs text-gray-400 mt-2.5 leading-relaxed line-clamp-2">{i.description}</p>
                    )}
                  </div>

                  {/* Expandable Details */}
                  <div className={`border-t border-white/5 transition-all duration-200 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-4 pt-3 space-y-2.5">
                      <div className="flex gap-2">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-20 shrink-0 pt-0.5">Eligibility</span>
                        <span className="text-xs text-gray-400 leading-relaxed">{i.eligibility}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-20 shrink-0 pt-0.5">Requirements</span>
                        <span className="text-xs text-gray-400 leading-relaxed">{i.requirements}</span>
                      </div>
                      {i.documentsRequired && (
                        <div className="flex gap-2">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-20 shrink-0 pt-0.5">Documents</span>
                          <span className="text-xs text-gray-400 leading-relaxed">{i.documentsRequired}</span>
                        </div>
                      )}
                      {i.benefits && (
                        <div className="flex gap-2">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-20 shrink-0 pt-0.5">Benefits</span>
                          <span className="text-xs text-gray-400 leading-relaxed">{i.benefits}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto px-4 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : i.id)}
                      className="text-xs text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1"
                    >
                      <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {isExpanded ? 'Less details' : 'More details'}
                    </button>
                    {i.applicationUrl && (
                      <a href={i.applicationUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Apply Now
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    )}
                  </div>
                </div>
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
