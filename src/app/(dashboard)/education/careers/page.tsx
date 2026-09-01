'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface CareerPath {
  _id: string;
  title: string;
  field: string;
  skills: string[];
  entryRoles: string[];
  slug: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CareersPage() {
  const [careers, setCareers] = useState<CareerPath[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [field, setField] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchField, setSearchField] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCareers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        if (field) params.set('field', field);
        params.set('page', String(page));
        const res = await apiClient.get<{ data: { careerPaths: CareerPath[]; pagination: Pagination } }>(`/api/education/career-paths?${params}`);
        if (!cancelled) {
          setCareers(res.data.careerPaths);
          setPagination(res.data.pagination);
        }
      } catch {
        if (!cancelled) setCareers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCareers();
    return () => { cancelled = true; };
  }, [keyword, field, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchKeyword);
    setField(searchField);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <a href="/education" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Education Center
        </a>
        <h1 className="text-2xl font-bold gradient-text">Career Guidance</h1>
        <p className="text-cyan-400 mt-1">Explore career paths and find your direction</p>
      </div>

      <form onSubmit={handleSearch} className="card space-y-4">
        <input
          type="text"
          placeholder="Search careers or fields..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="input-field"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select value={searchField} onChange={(e) => setSearchField(e.target.value)} className="input-field">
            <option value="">All Fields</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Business">Business</option>
            <option value="Engineering">Engineering</option>
            <option value="Arts">Arts</option>
            <option value="Education">Education</option>
            <option value="Law">Law</option>
            <option value="Science">Science</option>
          </select>
          <button type="submit" className="btn-primary">Search</button>
        </div>
      </form>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-5 skeleton rounded w-1/2" />
              <div className="h-4 skeleton rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : careers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-cyan-400">No career paths found. Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-violet-400">{pagination.total} career paths found</p>
          <div className="space-y-3">
            {careers.map((c) => (
              <div key={c._id} className="card-hover" onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{c.title}</h3>
                    <p className="text-sm text-violet-400">{c.field}</p>
                  </div>
                  <span className="text-cyan-400 text-sm">{expandedId === c._id ? '▲' : '▼'}</span>
                </div>
                {expandedId === c._id && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    {c.skills?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-cyan-400 mb-1">Key Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {c.skills.map((s, i) => (
                            <span key={i} className="text-xs bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {c.entryRoles?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-violet-400 mb-1">Entry Roles</p>
                        <div className="flex flex-wrap gap-1">
                          {c.entryRoles.map((r, i) => (
                            <span key={i} className="text-xs bg-white/5 text-cyan-400 px-2 py-0.5 rounded-full">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <Link href={`/education/careers/${c.slug}`} className="text-sm text-primary-600 hover:underline">
                      View full details &rarr;
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm disabled:opacity-40">Prev</button>
              <span className="text-sm text-cyan-400">Page {page} of {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
