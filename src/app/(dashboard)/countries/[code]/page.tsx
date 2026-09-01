'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { VerificationBadge } from '@/components/ui/verification-badge';

interface Indices {
  costOfLiving: number;
  safety: number;
  qualityOfLife: number;
}

interface Authority {
  name: string;
  acronym: string;
  type: string;
  website: string;
  isVerified: boolean;
}

interface CountryScholarship {
  name: string;
  provider: string;
  type: string;
  amount: string;
  deadline: string;
  eligibility: string;
  isVerified: boolean;
}

interface VisaSource {
  sourceName: string;
  type: string;
  processingTime: string;
  requirements: string[];
  isVerified: boolean;
}

interface LivingCost {
  category: string;
  subcategory: string;
  averageCost: number | string;
  currency: string;
  period: string;
  source: string;
}

interface AdmissionRequirement {
  level: string;
  requirementType: string;
  description: string;
}

interface CountryDetail {
  code: string;
  name: string;
  region: string;
  capital: string;
  currency: string;
  language: string;
  educationSystem: string;
  timezone: string;
  overview: string;
  indices: Indices;
  authorities: Authority[];
  scholarships: CountryScholarship[];
  visaSources: VisaSource[];
  costs: LivingCost[];
  admissionRequirements: AdmissionRequirement[];
}

const TABS = ['Overview', 'Authorities', 'Scholarships', 'Visa', 'Costs', 'Admission', 'Compare'] as const;
type Tab = (typeof TABS)[number];

function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '\uD83C\uDF0D';
  const base = 0x1f1e6;
  const chars = code.toUpperCase().split('');
  return String.fromCodePoint(base + chars[0].charCodeAt(0) - 65, base + chars[1].charCodeAt(0) - 65);
}

function groupBy<T>(items: T[], getKey: (item: T) => string): [string, T[]][] {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const key = getKey(item);
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  });
  return Array.from(map.entries());
}

function formatDeadline(deadline: string): string {
  if (!deadline) return 'N/A';
  const date = new Date(deadline);
  return Number.isNaN(date.getTime()) ? deadline : date.toLocaleDateString();
}

export default function CountryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = React.use(params);
  const [country, setCountry] = useState<CountryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('Overview');

  useEffect(() => {
    apiClient.get<{ data: { country: CountryDetail } }>(`/api/countries/${code}`)
      .then((res) => setCountry(res.data.country))
      .catch((err) => setError(err.message || 'Failed to load country'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 skeleton rounded w-32" />
        <div className="h-8 skeleton rounded w-1/3" />
        <div className="h-24 skeleton rounded" />
        <div className="h-48 skeleton rounded" />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Country not found'}</p>
        <Link href="/countries" className="btn-secondary">Back to Countries</Link>
      </div>
    );
  }

  const facts: [string, string][] = [
    ['Region', country.region],
    ['Capital', country.capital],
    ['Currency', country.currency],
    ['Language', country.language],
    ['Education System', country.educationSystem],
    ['Timezone', country.timezone],
  ];

  const indexCards: [string, number][] = (
    [
      ['Cost of Living', country.indices?.costOfLiving],
      ['Safety', country.indices?.safety],
      ['Quality of Life', country.indices?.qualityOfLife],
    ] as [string, number | undefined][]
  ).filter((entry): entry is [string, number] => entry[1] != null);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <Link href="/countries" className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700">
        &larr; Back to Countries
      </Link>

      <div className="card">
        <div className="flex items-center gap-4">
          <span className="text-5xl" aria-hidden>{getFlagEmoji(country.code)}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{country.name}</h1>
            <p className="text-gray-500 mt-0.5">{[country.region, country.capital].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-primary-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {indexCards.map(([label, value]) => (
              <div key={label} className="card text-center py-4">
                <p className="text-2xl font-bold text-primary-600">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <h2 className="font-semibold text-gray-100 mb-3">Key Facts</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {facts.filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-white/10 pb-2 last:border-0">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm text-gray-200 font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {country.overview && (
            <div className="card">
              <h2 className="font-semibold text-gray-100 mb-2">Overview</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{country.overview}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'Authorities' && (
        (country.authorities || []).length === 0 ? (
          <div className="card text-center py-12"><p className="text-gray-500">No education authorities available.</p></div>
        ) : (
          <div className="space-y-3">
            {(country.authorities || []).map((a, i) => (
              <div key={i} className="card flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-100">{a.name} {a.acronym && <span className="text-gray-500 font-normal">({a.acronym})</span>}</h3>
                  <p className="text-sm text-gray-400 mt-0.5 capitalize">{a.type}</p>
                  {a.website && (
                    <a href={a.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline mt-1 inline-block">
                      Visit Website &rarr;
                    </a>
                  )}
                </div>
                <VerificationBadge status={a.isVerified ? 'verified' : 'unverified'} compact />
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'Scholarships' && (
        (country.scholarships || []).length === 0 ? (
          <div className="card text-center py-12"><p className="text-gray-500">No scholarships available for this country.</p></div>
        ) : (
          <div className="space-y-3">
            {(country.scholarships || []).map((s, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-gray-100">{s.name}</h3>
                  <VerificationBadge status={s.isVerified ? 'verified' : 'unverified'} compact />
                </div>
                <p className="text-sm text-gray-400 mt-1">{s.provider}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  {s.type && <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400">{s.type}</span>}
                  {s.amount && <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{s.amount}</span>}
                  <span className={`px-2 py-0.5 rounded-full ${new Date(s.deadline).getTime() - Date.now() <= 14 * 24 * 60 * 60 * 1000 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-gray-400'}`}>
                    Deadline: {formatDeadline(s.deadline)}
                  </span>
                </div>
                {s.eligibility && <p className="text-sm text-gray-500 mt-2"><span className="font-medium text-gray-300">Eligibility:</span> {s.eligibility}</p>}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'Visa' && (
        (country.visaSources || []).length === 0 ? (
          <div className="card text-center py-12"><p className="text-gray-500">No visa information available.</p></div>
        ) : (
          <div className="space-y-3">
            {(country.visaSources || []).map((v, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-100">{v.sourceName}</h3>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      {v.type && <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400">{v.type}</span>}
                      {v.processingTime && <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">Processing: {v.processingTime}</span>}
                    </div>
                  </div>
                  <VerificationBadge status={v.isVerified ? 'verified' : 'unverified'} compact />
                </div>
                {(v.requirements || []).length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-300 mb-1">Requirements</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                      {v.requirements.map((r, j) => <li key={j}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'Costs' && (
        (country.costs || []).length === 0 ? (
          <div className="card text-center py-12"><p className="text-gray-500">No cost data available.</p></div>
        ) : (
          <div className="space-y-4">
            {groupBy(country.costs || [], (c) => c.category).map(([category, items]) => (
              <div key={category} className="card">
                <h2 className="font-semibold text-gray-100 mb-3">{category}</h2>
                <div className="divide-y divide-gray-100">
                  {items.map((c, i) => (
                    <div key={i} className="py-2 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{c.subcategory}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Source: {c.source}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-100">{c.currency} {c.averageCost}</p>
                        <p className="text-xs text-gray-500">{c.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'Admission' && (
        (country.admissionRequirements || []).length === 0 ? (
          <div className="card text-center py-12"><p className="text-gray-500">No admission requirements available.</p></div>
        ) : (
          <div className="space-y-4">
            {groupBy(country.admissionRequirements || [], (r) => r.level).map(([level, items]) => (
              <div key={level} className="card">
                <h2 className="font-semibold text-gray-100 mb-3 capitalize">{level}</h2>
                <div className="divide-y divide-gray-100">
                  {items.map((r, i) => (
                    <div key={i} className="py-2">
                      <p className="text-sm font-medium text-gray-200">{r.requirementType}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'Compare' && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-100">Indices at a Glance</h2>
            {indexCards.length === 0 ? (
              <p className="text-sm text-gray-500">No index data available.</p>
            ) : (
              indexCards.map(([label, value]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-medium text-gray-100">{value}/100</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="card">
            <h2 className="font-semibold text-gray-100 mb-3">Quick Facts</h2>
            <dl className="space-y-2">
              {facts.filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm text-gray-200 font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-500 mb-3">Want a deeper side-by-side comparison?</p>
            <Link href="/education/universities" className="btn-secondary inline-block">Compare Universities &rarr;</Link>
          </div>
        </div>
      )}
    </div>
  );
}
