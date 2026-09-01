'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface Deadline {
  _id: string;
  name: string;
  provider: string;
  deadline: string;
  country: string;
}

const sections = [
  { title: 'AI Recommendations', emoji: '🎯', href: '/education/recommendations', desc: <>Get <span className="text-violet-400">personalized</span> university, course, and scholarship matches</>, gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', iconBg: 'rgba(139,92,246,0.15)', delay: 0 },
  { title: 'Find a Course', emoji: '🎓', href: '/education/courses', desc: <><span className="text-cyan-400">Search courses</span> by field, level, and country</>, gradient: 'from-cyan-500 via-blue-500 to-indigo-500', iconBg: 'rgba(6,182,212,0.15)', delay: 50 },
  { title: 'Find a University', emoji: '🏫', href: '/education/universities', desc: <><span className="text-emerald-400">Explore</span> universities worldwide</>, gradient: 'from-emerald-500 via-teal-500 to-cyan-500', iconBg: 'rgba(16,185,129,0.15)', delay: 100 },
  { title: 'Find Scholarships', emoji: '🎁', href: '/education/scholarships', desc: <><span className="text-amber-400">Find scholarships</span> you qualify for</>, gradient: 'from-amber-500 via-orange-500 to-red-500', iconBg: 'rgba(245,158,11,0.15)', delay: 150 },
  { title: 'Internships & Fellowships', emoji: '💼', href: '/education/internships', desc: <><span className="text-rose-400">Find</span> internships, fellowships, and house jobs</>, gradient: 'from-rose-500 via-pink-500 to-fuchsia-500', iconBg: 'rgba(244,63,94,0.15)', delay: 200 },
  { title: 'Government Schemes', emoji: '🇵🇰', href: '/education/schemes', desc: <><span className="text-green-400">Scholarships</span>, loans, and aid from Pakistani government</>, gradient: 'from-green-500 via-emerald-500 to-teal-500', iconBg: 'rgba(34,197,94,0.15)', delay: 250 },
  { title: 'CM Programs', emoji: '🏛️', href: '/education/cm-programs', desc: <>Chief Minister <span className="text-indigo-400">programs</span> for all Pakistan provinces</>, gradient: 'from-indigo-500 via-blue-500 to-cyan-500', iconBg: 'rgba(99,102,241,0.15)', delay: 300 },
  { title: 'Free Course Institutions', emoji: '📚', href: '/education/institutions', desc: <>Find institutions offering <span className="text-yellow-400">free courses</span></>, gradient: 'from-yellow-500 via-amber-500 to-orange-500', iconBg: 'rgba(234,179,8,0.15)', delay: 350 },
  { title: 'Build My Roadmap', emoji: '🗺️', href: '/education/roadmap', desc: <><span className="text-pink-400">Create</span> your personalized education roadmap</>, gradient: 'from-pink-500 via-rose-500 to-red-500', iconBg: 'rgba(236,72,153,0.15)', delay: 400 },
  { title: 'Career After Degree', emoji: '💼', href: '/education/careers', desc: <><span className="text-teal-400">Explore</span> career paths and guidance</>, gradient: 'from-teal-500 via-cyan-500 to-blue-500', iconBg: 'rgba(20,184,166,0.15)', delay: 450 },
  { title: 'Study Abroad', emoji: '✈️', href: '/education/study-abroad', desc: <><span className="text-blue-400">Guide</span> to studying in another country</>, gradient: 'from-blue-500 via-indigo-500 to-violet-500', iconBg: 'rgba(59,130,246,0.15)', delay: 500 },
  { title: 'Cost Planner', emoji: '💰', href: '/education/cost-planner', desc: <><span className="text-orange-400">Plan</span> and compare education costs worldwide</>, gradient: 'from-orange-500 via-red-500 to-pink-500', iconBg: 'rgba(249,115,22,0.15)', delay: 550 },
];

export default function EducationPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loadingDeadlines, setLoadingDeadlines] = useState(true);

  useEffect(() => {
    apiClient.get<{ data: { scholarships: Deadline[] } }>('/api/education/scholarships/deadlines?limit=5')
      .then((res) => setDeadlines(res.data.scholarships))
      .catch(() => setDeadlines([]))
      .finally(() => setLoadingDeadlines(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="animate-slide-up">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold gradient-text">Education Center</h1>
        <p className="text-sm mt-2">Everything you need for your <span className="text-cyan-400 font-medium">education</span> journey</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl animate-slide-up" style={{ animationDelay: `${s.delay}ms`, background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.iconBg.replace('0.15', '0.5').replace('rgba', 'rgba'); }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)'; }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${s.iconBg}, transparent)` }} />
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
              {s.emoji}
            </div>
            <h2 className={`text-lg font-semibold mt-3 transition-all duration-500 bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent group-hover:scale-[1.02] origin-left`}>{s.title}</h2>
            <p className="text-sm mt-1 transition-colors">{s.desc}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', animationDelay: '600ms' }}>
        <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.08))', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Upcoming Scholarship Deadlines</span>
          </h2>
        </div>
        <div className="p-6">
          {loadingDeadlines ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-white/5 animate-shimmer" />
              ))}
            </div>
          ) : deadlines.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No upcoming deadlines found.</p>
          ) : (
            <div className="space-y-3">
              {deadlines.map((d) => {
                const daysLeft = Math.ceil((new Date(d.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const urgent = daysLeft <= 14;
                return (
                  <div key={d._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group" style={{ border: '1px solid transparent' }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${urgent ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-all">{d.name}</p>
                        <p className="text-xs text-slate-400">{d.provider} &middot; <span className="text-cyan-400">{d.country}</span></p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${urgent ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                      {daysLeft <= 0 ? 'Passed' : daysLeft <= 90 ? `${daysLeft}d to apply` : `${daysLeft}d to apply`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
