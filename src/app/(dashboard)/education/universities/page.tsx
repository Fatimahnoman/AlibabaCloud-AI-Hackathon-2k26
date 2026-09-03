'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface University {
  id: string;
  name: string;
  country: string;
  city: string | null;
  type: string;
  sector: string | null;
  description: string | null;
  foundedYear: number | null;
  website: string | null;
  _count: { courses: number; campuses: number };
  verificationStatus: string;
  courses?: { name: string; degree: string; department: string | null; tuitionFee: string | null; currency: string | null }[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


const DEGREE_COLORS: Record<string, string> = {
  bachelor: 'bg-emerald-500/10 text-emerald-400',
  bachelor_of_medicine: 'bg-red-500/10 text-red-400',
  bachelor_of_engineering: 'bg-orange-500/10 text-orange-400',
  bachelor_of_law: 'bg-indigo-500/10 text-indigo-400',
  bachelor_of_education: 'bg-teal-500/10 text-teal-400',
  bachelor_of_commerce: 'bg-emerald-500/10 text-emerald-400',
  master: 'bg-purple-500/10 text-purple-400',
  phd: 'bg-rose-500/10 text-rose-400',
  intermediate: 'bg-green-500/10 text-green-400',
  diploma: 'bg-yellow-500/10 text-yellow-400',
  certificate: 'bg-white/5 text-gray-300',
};

const SECTOR_LABELS: Record<string, string> = {
  government: 'Govt',
  private: 'Private',
  federal: 'Federal',
  'semi-government': 'Semi-Govt',
};

const TYPE_LABELS: Record<string, string> = {
  university: 'University',
  college: 'College',
  school: 'School',
};

const SECTOR_COLORS: Record<string, string> = {
  government: 'bg-green-500/10 text-green-400 border-green-500/20',
  private: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  federal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'semi-government': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function UniversitiesPage() {
  // All available options for each cascade level
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [institutionTypes, setInstitutionTypes] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [institutes, setInstitutes] = useState<Array<{ id: string; name: string; city: string | null; type: string; sector: string | null; _count: { courses: number; departments: number } }>>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [programs, setPrograms] = useState<Array<{ name: string; degree: string }>>([]);

  // Current selections
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [instType, setInstType] = useState('');
  const [sector, setSector] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('');

  // Results
  const [universities, setUniversities] = useState<University[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  // Loading states for each cascade level
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // ===== CASCADE LEVEL 1: Countries (on mount) =====
  useEffect(() => {
    apiClient.get<{ data: { countries: string[] } }>('/api/education/universities/countries')
      .then((res) => setCountries(res.data.countries))
      .catch(() => setCountries([]));
  }, []);

  // ===== CASCADE LEVEL 2: Cities (depends on: country) =====
  useEffect(() => {
    if (!country) { setCities([]); return; }
    setLoadingCities(true);
    setCity(''); setInstType(''); setSector(''); setSelectedInstitute(''); setDepartment(''); setProgram('');
    const params = new URLSearchParams({ country });
    apiClient.get<{ data: { cities: string[] } }>(`/api/education/universities/cities?${params}`)
      .then((res) => setCities(res.data.cities))
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [country]);

  // ===== CASCADE LEVEL 3: Institution Types (depends on: country, city) =====
  useEffect(() => {
    if (!country) { setInstitutionTypes([]); return; }
    setLoadingTypes(true);
    setInstType(''); setSector(''); setSelectedInstitute(''); setDepartment(''); setProgram('');
    const params = new URLSearchParams({ country });
    if (city) params.set('city', city);
    apiClient.get<{ data: { types: string[] } }>(`/api/education/universities/institution-types?${params}`)
      .then((res) => setInstitutionTypes(res.data.types))
      .catch(() => setInstitutionTypes([]))
      .finally(() => setLoadingTypes(false));
  }, [country, city]);

  // ===== CASCADE LEVEL 4: Sectors (depends on: country, city, instType) =====
  useEffect(() => {
    if (!country) { setSectors([]); return; }
    setLoadingSectors(true);
    setSector(''); setSelectedInstitute(''); setDepartment(''); setProgram('');
    const params = new URLSearchParams({ country });
    if (city) params.set('city', city);
    if (instType) params.set('type', instType);
    apiClient.get<{ data: { sectors: string[] } }>(`/api/education/universities/sectors?${params}`)
      .then((res) => setSectors(res.data.sectors))
      .catch(() => setSectors([]))
      .finally(() => setLoadingSectors(false));
  }, [country, city, instType]);

  // ===== CASCADE LEVEL 5: Institutes (depends on: country, city, instType, sector) =====
  useEffect(() => {
    if (!country) { setInstitutes([]); return; }
    setLoadingInstitutes(true);
    setSelectedInstitute(''); setDepartment(''); setProgram('');
    const params = new URLSearchParams({ country });
    if (city) params.set('city', city);
    if (instType) params.set('type', instType);
    if (sector) params.set('sector', sector);
    apiClient.get<{ data: { universities: typeof institutes } }>(`/api/education/universities/list?${params}`)
      .then((res) => setInstitutes(res.data.universities))
      .catch(() => setInstitutes([]))
      .finally(() => setLoadingInstitutes(false));
  }, [country, city, instType, sector]);

  // ===== CASCADE LEVEL 6: Departments (depends on: selectedInstitute) =====
  useEffect(() => {
    if (!selectedInstitute) { setDepartments([]); return; }
    setLoadingDepts(true);
    setDepartment(''); setProgram('');
    const params = new URLSearchParams({ universityId: selectedInstitute });
    apiClient.get<{ data: { departments: string[] } }>(`/api/education/universities/departments?${params}`)
      .then((res) => setDepartments(res.data.departments))
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepts(false));
  }, [selectedInstitute]);

  // ===== CASCADE LEVEL 7: Programs (depends on: selectedInstitute, department) =====
  useEffect(() => {
    if (!selectedInstitute) { setPrograms([]); return; }
    setLoadingPrograms(true);
    setProgram('');
    const params = new URLSearchParams({ universityId: selectedInstitute });
    if (department) params.set('department', department);
    apiClient.get<{ data: { programs: { name: string; degree: string }[] } }>(`/api/education/universities/programs?${params}`)
      .then((res) => setPrograms(res.data.programs))
      .catch(() => setPrograms([]))
      .finally(() => setLoadingPrograms(false));
  }, [selectedInstitute, department]);

  // ===== FETCH RESULTS =====
  const fetchUniversities = useCallback(async (page = 1) => {
    if (!country) { setUniversities([]); setPagination({ total: 0, page: 1, limit: 12, totalPages: 0 }); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ country, page: String(page), limit: '12' });
      if (city) params.set('city', city);
      if (instType) params.set('type', instType);
      if (sector) params.set('sector', sector);
      if (selectedInstitute) params.set('universityId', selectedInstitute);
      if (department) params.set('department', department);
      if (program) params.set('program', program);
      const res = await apiClient.get<{ data: { universities: University[]; pagination: Pagination } }>(`/api/education/universities?${params}`);
      setUniversities(res.data.universities);
      setPagination(res.data.pagination);
    } catch {
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  }, [country, city, instType, sector, selectedInstitute, department, program]);

  useEffect(() => { fetchUniversities(1); }, [fetchUniversities]);

  const hasFilters = country || city || instType || sector || selectedInstitute || department || program;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/education" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Education Center
        </Link>
        <h1 className="text-2xl font-bold gradient-text">Find a University</h1>
        <p className="text-gray-400 mt-1">Step-by-step: Country → City → Type → Sector → Institute → Department → Program</p>
      </div>

      {/* ===== 6-LEVEL CASCADING FILTER ===== */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <span className="font-medium bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Cascading Filter</span>
          </div>
          <span className="text-gray-500 text-xs">Country → City → Type → Sector → Institute → Department → Program</span>
        </div>

        {/* Row 1: Country, City, Type, Sector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Country — Blue */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />1. Country
            </label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-field">
              <option value="">Select Country</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 2. City — Cyan */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />2. City
            </label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field input-cyan"
              disabled={!country || loadingCities}>
              <option value="">{loadingCities ? 'Loading...' : country ? 'All Cities' : 'Select country first'}</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 3. Institution Type — Purple */}
          <div>
            <label className="block text-xs font-semibold text-purple-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />3. Institution Type
            </label>
            <select value={instType} onChange={(e) => setInstType(e.target.value)} className="input-field input-purple"
              disabled={!country || loadingTypes}>
              <option value="">{loadingTypes ? 'Loading...' : country ? 'All Types' : 'Select country first'}</option>
              {institutionTypes.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
            </select>
          </div>

          {/* 4. Sector — Amber */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />4. Sector
            </label>
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="input-field input-amber"
              disabled={!country || loadingSectors}>
              <option value="">{loadingSectors ? 'Loading...' : country ? 'All Sectors' : 'Select country first'}</option>
              {sectors.map((s) => <option key={s} value={s}>{SECTOR_LABELS[s] || s}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Institute */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 5. Institute — Emerald */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />5. Institute
            </label>
            <select value={selectedInstitute} onChange={(e) => setSelectedInstitute(e.target.value)} className="input-field input-emerald"
              disabled={!country || loadingInstitutes}>
              <option value="">{loadingInstitutes ? 'Loading...' : country ? `All Institutes (${institutes.length})` : 'Select filters first'}</option>
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} {inst.city ? `— ${inst.city}` : ''} {inst._count.departments > 0 ? `(${inst._count.departments} depts, ${inst._count.courses} programs)` : `(${inst._count.courses} programs)`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Department, Program */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 6. Department — Rose */}
          <div>
            <label className="block text-xs font-semibold text-rose-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />6. Department
            </label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field input-rose"
              disabled={!selectedInstitute || loadingDepts}>
              <option value="">{loadingDepts ? 'Loading...' : selectedInstitute ? 'All Departments' : 'Select institute first'}</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* 7. Program — Indigo */}
          <div>
            <label className="block text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />7. Program
            </label>
            <select value={program} onChange={(e) => setProgram(e.target.value)} className="input-field input-indigo"
              disabled={!selectedInstitute || loadingPrograms}>
              <option value="">{loadingPrograms ? 'Loading...' : selectedInstitute ? 'All Programs' : 'Select institute first'}</option>
              {programs.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Active filter badges */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Active:</span>
            {country && (
              <button onClick={() => { setCountry(''); setCity(''); setInstType(''); setSector(''); setSelectedInstitute(''); setDepartment(''); setProgram(''); }}
                className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                {country} <span className="font-bold">×</span>
              </button>
            )}
            {city && (
              <button onClick={() => { setCity(''); setInstType(''); setSector(''); setSelectedInstitute(''); setDepartment(''); setProgram(''); }}
                className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full hover:bg-green-500/20 transition-colors flex items-center gap-1">
                {city} <span className="font-bold">×</span>
              </button>
            )}
            {instType && (
              <button onClick={() => { setInstType(''); setSector(''); setSelectedInstitute(''); setDepartment(''); setProgram(''); }}
                className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-full hover:bg-indigo-500/20 transition-colors flex items-center gap-1">
                {TYPE_LABELS[instType] || instType} <span className="font-bold">×</span>
              </button>
            )}
            {sector && (
              <button onClick={() => { setSector(''); setSelectedInstitute(''); setDepartment(''); setProgram(''); }}
                className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full hover:bg-amber-500/20 transition-colors flex items-center gap-1">
                {SECTOR_LABELS[sector] || sector} <span className="font-bold">×</span>
              </button>
            )}
            {selectedInstitute && (
              <button onClick={() => { setSelectedInstitute(''); setDepartment(''); setProgram(''); }}
                className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                {institutes.find(i => i.id === selectedInstitute)?.name || 'Selected'} <span className="font-bold">×</span>
              </button>
            )}
            {department && (
              <button onClick={() => { setDepartment(''); setProgram(''); }}
                className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full hover:bg-purple-500/20 transition-colors flex items-center gap-1">
                {department} <span className="font-bold">×</span>
              </button>
            )}
            {program && (
              <button onClick={() => setProgram('')}
                className="text-xs bg-rose-500/10 text-rose-400 px-2 py-1 rounded-full hover:bg-rose-500/20 transition-colors flex items-center gap-1">
                {program} <span className="font-bold">×</span>
              </button>
            )}
            <button onClick={() => { setCountry(''); setCity(''); setInstType(''); setSector(''); setSelectedInstitute(''); setDepartment(''); setProgram(''); }}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors ml-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ===== RESULTS ===== */}
      {!country ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4 animate-float">🌍</div>
          <p className="text-lg font-semibold gradient-text">Select a country to get started</p>
          <p className="text-sm text-gray-400 mt-2">Browse <span className="font-semibold text-emerald-400">{countries.length}</span> countries with universities in our database</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-8 max-w-3xl mx-auto">
            {countries.map((c, idx) => {
              const flag = c === 'Pakistan' ? '🇵🇰' : c === 'United States' ? '🇺🇸' : c === 'United Kingdom' ? '🇬🇧' : c === 'Germany' ? '🇩🇪' : c === 'Canada' ? '🇨🇦' : c === 'Australia' ? '🇦🇺' : c === 'China' ? '🇨🇳' : c === 'Japan' ? '🇯🇵' : c === 'South Korea' ? '🇰🇷' : c === 'Turkey' ? '🇹🇷' : c === 'Saudi Arabia' ? '🇸🇦' : c === 'UAE' || c === 'United Arab Emirates' ? '🇦🇪' : c === 'India' ? '🇮🇳' : c === 'Malaysia' ? '🇲🇾' : c === 'Singapore' ? '🇸🇬' : c === 'Thailand' ? '🇹🇭' : c === 'Philippines' ? '🇵🇭' : c === 'Sweden' ? '🇸🇪' : c === 'Norway' ? '🇳🇴' : c === 'Denmark' ? '🇩🇰' : c === 'Finland' ? '🇫🇮' : c === 'Hungary' ? '🇭🇺' : c === 'New Zealand' ? '🇳🇿' : '🌍';
              const colors = [
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/40 hover:shadow-[0_0_24px_rgba(59,130,246,0.15)]',
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/40 hover:shadow-[0_0_24px_rgba(6,182,212,0.15)]',
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/40 hover:shadow-[0_0_24px_rgba(16,185,129,0.15)]',
                'bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.15)]',
                'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/40 hover:shadow-[0_0_24px_rgba(245,158,11,0.15)]',
                'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/40 hover:shadow-[0_0_24px_rgba(244,63,94,0.15)]',
                'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/40 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)]',
                'bg-teal-500/10 border-teal-500/20 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400/40 hover:shadow-[0_0_24px_rgba(20,184,166,0.15)]',
              ];
              const colorClass = colors[idx % colors.length];
              return (
                <button key={c} onClick={() => setCountry(c)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${colorClass}`}>
                  <span className="text-lg">{flag}</span>
                  <span className="truncate">{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card space-y-3">
              <div className="h-5 skeleton rounded w-3/4" />
              <div className="h-4 skeleton rounded w-1/2" />
              <div className="h-3 skeleton rounded w-2/3" />
              <div className="flex gap-2"><div className="h-5 w-16 skeleton rounded-full" /><div className="h-5 w-20 skeleton rounded-full" /></div>
            </div>
          ))}
        </div>
      ) : universities.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🏫</div>
          <p className="text-gray-500 font-medium">No institutions found</p>
          <p className="text-sm text-gray-400 mt-1">Try removing some filters or selecting a different option</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              <span className="font-bold text-lg gradient-text">{pagination.total}</span>
              <span className="ml-1.5">institutions found</span>
              {city && <span> in <span className="font-medium text-emerald-400">{city}</span></span>}
              {instType && <span> &middot; <span className="font-medium text-purple-400">{TYPE_LABELS[instType] || instType}</span></span>}
              {sector && <span> &middot; <span className="font-medium text-amber-400">{SECTOR_LABELS[sector] || sector}</span></span>}
              {department && <span> &middot; <span className="font-medium text-rose-400">{department}</span></span>}
              {program && <span> &middot; <span className="font-medium text-indigo-400">{program}</span></span>}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {universities.map((u) => (
              <Link key={u.id} href={`/education/universities/${u.id}`} className="card-hover group relative overflow-hidden">
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                  u.sector === 'government' ? 'from-green-500 to-emerald-500' :
                  u.sector === 'private' ? 'from-emerald-500 to-indigo-500' :
                  u.sector === 'federal' ? 'from-purple-500 to-violet-500' :
                  'from-amber-500 to-orange-500'
                }`} />

                <div className="flex items-start justify-between mb-2 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {TYPE_LABELS[u.type] || u.type}
                    </span>
                    {u.sector && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${SECTOR_COLORS[u.sector] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                        {SECTOR_LABELS[u.sector] || u.sector}
                      </span>
                    )}
                  </div>
                  {u.verificationStatus === 'verified' && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-100 group-hover:text-emerald-400 transition-colors line-clamp-2">{u.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <p className="text-sm text-gray-500">{u.city || 'N/A'}, {u.country}</p>
                </div>
                {u.description && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{u.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
                  {u.foundedYear && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Est. {u.foundedYear}
                    </span>
                  )}
                  {u._count.courses > 0 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      {u._count.courses} programs
                    </span>
                  )}
                  {u._count.campuses > 1 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      {u._count.campuses} campuses
                    </span>
                  )}
                </div>
                {department && u.courses && u.courses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {u.courses.slice(0, 3).map((c, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-lg border ${DEGREE_COLORS[c.degree] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                        {c.name}
                      </span>
                    ))}
                    {u.courses.length > 3 && (
                      <span className="text-xs text-gray-500 self-center">+{u.courses.length - 3} more</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button disabled={pagination.page <= 1} onClick={() => fetchUniversities(pagination.page - 1)}
                className="btn-secondary text-sm disabled:opacity-40">Previous</button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const start = Math.max(1, pagination.page - 2);
                const pageNum = start + i;
                if (pageNum > pagination.totalPages) return null;
                return (
                  <button key={pageNum} onClick={() => fetchUniversities(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      pagination.page === pageNum ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-white/5'
                    }`}>{pageNum}</button>
                );
              })}
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchUniversities(pagination.page + 1)}
                className="btn-secondary text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
