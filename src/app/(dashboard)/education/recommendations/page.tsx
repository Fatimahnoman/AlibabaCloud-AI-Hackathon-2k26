'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface RecUni {
  id: string;
  name: string;
  country: string;
  city: string | null;
  type: string;
  sector: string | null;
  ranking: number | null;
  matchScore: number;
  matchReasons: string[];
  courses: { name: string; degree: string; department: string | null; tuitionFee: number | null; currency: string | null; description: string | null }[];
  departments: { name: string; totalCourses: number }[];
}

interface RecCourse {
  id: string;
  name: string;
  degree: string;
  department: string | null;
  tuitionFee: number | null;
  currency: string | null;
  universityName: string;
  universityCountry: string;
  matchScore: number;
  matchReasons: string[];
}

interface RecScholarship {
  id: string;
  name: string;
  provider: string;
  country: string | null;
  amount: number | null;
  currency: string | null;
  deadline: string | null;
  matchStrength: string;
  matchReasons: string[];
}

interface RecResult {
  universities: RecUni[];
  courses: RecCourse[];
  scholarships: RecScholarship[];
  aiSummary?: string;
}

const FIELDS = [
  'Computer Science', 'Engineering', 'Medicine', 'Business', 'Law',
  'Education', 'Arts', 'Science', 'Social Sciences', 'Agriculture',
  'Architecture', 'Design', 'Nursing', 'Pharmacy', 'Economics',
  'Psychology', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Accounting', 'Finance', 'Marketing', 'Management', 'Data Science',
  'Artificial Intelligence', 'Information Technology', 'Software Engineering',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Biotechnology', 'Environmental Science',
  'Political Science', 'Sociology', 'History', 'English', 'Urdu',
  'Islamic Studies', 'Journalism', 'Mass Communication', 'International Relations',
  'Public Administration', 'Business Administration', 'Human Resources',
  'Supply Chain Management', 'Actuarial Science', 'Statistics',
];

const DEGREES = [
  { value: 'intermediate', label: 'Intermediate / FSc / ICS / FA' },
  { value: 'bachelor', label: 'Bachelor / BS / BA / BSc / BCom' },
  { value: 'mbbs', label: 'MBBS — Medicine & Surgery' },
  { value: 'bds', label: 'BDS — Dental Surgery' },
  { value: 'pharm-d', label: 'Pharm-D — Pharmacy' },
  { value: 'llb', label: 'LLB — Law' },
  { value: 'dpt', label: 'DPT — Physical Therapy' },
  { value: 'barch', label: 'BArch — Architecture' },
  { value: 'bba', label: 'BBA — Business Administration' },
  { value: 'master', label: 'Master / MS / MA / MSc / MBA / MPhil' },
  { value: 'llm', label: 'LLM — Master of Laws' },
  { value: 'fcps', label: 'FCPS / MCPS — Medical Specialization' },
  { value: 'phd', label: 'PhD / Doctorate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'associate', label: 'Associate Degree / ADP' },
  { value: 'postdoc', label: 'Postdoctoral' },
];

const COUNTRIES = [
  { name: 'Pakistan', currency: 'PKR', symbol: 'Rs' },
  { name: 'United States', currency: 'USD', symbol: '$' },
  { name: 'United Kingdom', currency: 'GBP', symbol: '\u00a3' },
  { name: 'Canada', currency: 'CAD', symbol: 'CA$' },
  { name: 'Australia', currency: 'AUD', symbol: 'A$' },
  { name: 'Germany', currency: 'EUR', symbol: '\u20ac' },
  { name: 'Turkey', currency: 'TRY', symbol: '\u20ba' },
  { name: 'Saudi Arabia', currency: 'SAR', symbol: 'SR' },
  { name: 'UAE', currency: 'AED', symbol: 'AED' },
  { name: 'Malaysia', currency: 'MYR', symbol: 'RM' },
  { name: 'China', currency: 'CNY', symbol: '\u00a5' },
  { name: 'Japan', currency: 'JPY', symbol: '\u00a5' },
  { name: 'South Korea', currency: 'KRW', symbol: 'KRW' },
  { name: 'Netherlands', currency: 'EUR', symbol: '\u20ac' },
  { name: 'Sweden', currency: 'SEK', symbol: 'kr' },
];

const STRENGTH_COLORS: Record<string, string> = {
  strong: 'bg-green-500/10 text-green-400 border-green-500/20',
  possible: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  needs_verification: 'bg-white/5 text-gray-400 border-white/10',
  not_eligible: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const DEG_COLORS: Record<string, string> = {
  bachelor: 'bg-blue-500/10 text-blue-400',
  master: 'bg-purple-500/10 text-purple-400',
  phd: 'bg-rose-500/10 text-rose-400',
  diploma: 'bg-yellow-500/10 text-yellow-400',
  certificate: 'bg-white/5 text-gray-300',
  intermediate: 'bg-green-500/10 text-green-400',
};

function scoreColor(s: number) {
  if (s >= 80) return 'text-green-600';
  if (s >= 60) return 'text-blue-600';
  if (s >= 40) return 'text-yellow-600';
  return 'text-gray-500';
}

function scoreBg(s: number) {
  if (s >= 80) return 'bg-green-500';
  if (s >= 60) return 'bg-blue-500';
  if (s >= 40) return 'bg-yellow-500';
  return 'bg-gray-400';
}

function renderAiSummary(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;
    const isHeading = trimmed.startsWith('**') && trimmed.endsWith('**');
    if (isHeading) {
      const headingText = trimmed.slice(2, -2);
      return (
        <p key={i} className="font-bold text-gray-100 mt-3 mb-1 text-sm">
          {headingText}
        </p>
      );
    }
    const isBullet = trimmed.startsWith('- ');
    if (isBullet) {
      const content = trimmed.slice(2);
      return (
        <p key={i} className="text-sm text-gray-300 ml-3 flex gap-2 my-0.5">
          <span className="text-indigo-400 font-bold flex-shrink-0">&rsaquo;</span>
          <span>{renderBoldText(content)}</span>
        </p>
      );
    }
    return (
      <p key={i} className="text-sm text-gray-300 my-0.5">
        {renderBoldText(trimmed)}
      </p>
    );
  });
}

function renderBoldText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-100">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function getCurrency(name: string) {
  const c = COUNTRIES.find((x) => x.name === name);
  return c ? { code: c.currency, symbol: c.symbol } : { code: 'USD', symbol: '$' };
}

function StrengthBadge({ strength }: { strength: string }) {
  const label = strength === 'strong' ? 'Strong Match' : strength === 'possible' ? 'Possible' : strength === 'not_eligible' ? 'Not Eligible' : 'Verify';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${STRENGTH_COLORS[strength] || 'bg-white/5 text-gray-400'}`}>
      {label}
    </span>
  );
}

function ScoreDisplay({ score }: { score: number }) {
  return (
    <div className="ml-4 text-right flex-shrink-0">
      <div className={`text-2xl font-bold ${scoreColor(score)}`}>{score}%</div>
      <div className="w-16 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
        <div className={`h-full rounded-full ${scoreBg(score)}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">match</p>
    </div>
  );
}

export default function RecommendationsPage() {
  const [field, setField] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('');
  const [budget, setBudget] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'universities' | 'courses' | 'scholarships'>('universities');

  const cur = getCurrency(country);

  const handleSearch = async () => {
    if (!field && !country && !city && !degreeLevel && !budget && !careerGoal) {
      setError('Please fill in at least one field');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await apiClient.post<{ data: RecResult }>('/api/education/recommendations', {
        field: field || undefined,
        country: country || undefined,
        city: city || undefined,
        degreeLevel: degreeLevel || undefined,
        budget: budget ? Number(budget) : undefined,
        currency: cur.code,
        careerGoal: careerGoal || undefined,
      });
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'universities' as const, label: 'Universities', count: result?.universities.length ?? 0 },
    { key: 'courses' as const, label: 'Courses', count: result?.courses.length ?? 0 },
    { key: 'scholarships' as const, label: 'Scholarships', count: result?.scholarships.length ?? 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/education" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Education Center
        </Link>
        <h1 className="text-2xl font-bold text-gray-100">AI Recommendations</h1>
        <p className="text-gray-500 mt-1">Get personalized university, course, and scholarship recommendations</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Your Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Field of Study</label>
            <select value={field} onChange={(e) => setField(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] text-gray-100 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
              <option value="">Any field</option>
              {FIELDS.map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
            <select value={country} onChange={(e) => { setCountry(e.target.value); setCity(''); }} className="w-full rounded-lg border border-white/10 bg-white/[0.03] text-gray-100 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
              <option value="">Any country</option>
              {COUNTRIES.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder={country ? `e.g. ${country === 'Pakistan' ? 'Lahore, Karachi' : 'London, Berlin'}` : 'Any city'} className="w-full rounded-lg border border-white/10 bg-white/[0.03] text-gray-100 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Degree Level</label>
            <select value={degreeLevel} onChange={(e) => setDegreeLevel(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] text-gray-100 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
              <option value="">Any level</option>
              {DEGREES.map((d) => (<option key={d.value} value={d.value}>{d.label}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Max Budget ({cur.code}/year)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{cur.symbol}</span>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={country === 'Pakistan' ? 'e.g. 500000' : 'e.g. 15000'} className="w-full rounded-lg border border-white/10 bg-white/[0.03] text-gray-100 pl-8 pr-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Career Goal</label>
            <input type="text" value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} placeholder="e.g. Software Engineer, Doctor" className="w-full rounded-lg border border-white/10 bg-white/[0.03] text-gray-100 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button onClick={handleSearch} disabled={loading} className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {loading ? 'Finding matches...' : 'Get Recommendations'}
        </button>
      </div>

      {result && (
        <>
          {result.aiSummary && (
            <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 p-6 shadow-sm">
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-gradient-to-tr from-pink-500/10 to-indigo-500/10 blur-2xl" />
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <span className="text-white text-sm font-extrabold tracking-tighter">AI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-gray-100 mb-2 tracking-tight text-base">AI-Powered Insights</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{renderAiSummary(result.aiSummary)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-1 border-b border-white/10">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.key ? 'bg-primary-500/10 text-primary-400' : 'bg-white/5 text-gray-500'}`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'universities' && (
            <div className="space-y-4">
              {result.universities.length === 0 ? (
                <div className="card text-center py-8"><p className="text-gray-500">No matching universities found. Try broadening your search.</p></div>
              ) : result.universities.map((uni) => (
                <Link key={uni.id} href={`/education/universities/${uni.id}`} className="card-hover block">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-100">{uni.name}</h3>
                        {uni.ranking && <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">#{uni.ranking}</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{uni.city && `${uni.city}, `}{uni.country}{uni.sector && ` \u00b7 ${uni.sector}`}</p>
                      {uni.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {uni.matchReasons.map((r, i) => (<span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{r}</span>))}
                        </div>
                      )}
                      {uni.courses.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {uni.courses.slice(0, 4).map((c, i) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${DEG_COLORS[c.degree] || 'bg-white/5 text-gray-400'}`}>
                              {typeof c === 'string' ? c : (c.name || 'Unknown Course')}
                            </span>
                          ))}
                          {uni.courses.length > 4 && <span className="text-xs text-gray-400">+{uni.courses.length - 4} more</span>}
                        </div>
                      )}
                    </div>
                    <ScoreDisplay score={uni.matchScore} />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-4">
              {result.courses.length === 0 ? (
                <div className="card text-center py-8"><p className="text-gray-500">No matching courses found. Try broadening your search.</p></div>
              ) : result.courses.map((c) => (
                <div key={c.id} className="card-hover">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-100">{typeof c.name === 'string' ? c.name : 'Unknown Course'}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${DEG_COLORS[c.degree] || 'bg-white/5 text-gray-400'}`}>{typeof c.degree === 'string' ? c.degree : 'Unknown'}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{c.universityName} · {c.universityCountry}</p>
                      {c.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {c.matchReasons.map((r, i) => (<span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{typeof r === 'string' ? r : JSON.stringify(r)}</span>))}
                        </div>
                      )}
                    </div>
                    <ScoreDisplay score={c.matchScore} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scholarships' && (
            <div className="space-y-4">
              {result.scholarships.length === 0 ? (
                <div className="card text-center py-8"><p className="text-gray-500">No matching scholarships found. Try broadening your search.</p></div>
              ) : result.scholarships.map((s) => (
                <div key={s.id} className="card-hover">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-100">{s.name}</h3>
                        <StrengthBadge strength={s.matchStrength} />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{s.provider} \u00b7 {s.country}</p>
                      {s.amount && <p className="text-sm text-gray-400 mt-1">Amount: {s.currency || 'USD'} {s.amount.toLocaleString()}</p>}
                      {s.deadline && <p className="text-sm text-gray-500 mt-1">Deadline: {new Date(s.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
                      {s.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {s.matchReasons.map((r, i) => (<span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{r}</span>))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!result && !loading && (
        <div className="card text-center py-12">
          <span className="text-4xl">🎯</span>
          <h3 className="text-lg font-semibold text-gray-100 mt-4">Find Your Perfect Match</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">Tell us your preferences above and our AI will find the best universities, courses, and scholarships for you.</p>
        </div>
      )}
    </div>
  );
}
