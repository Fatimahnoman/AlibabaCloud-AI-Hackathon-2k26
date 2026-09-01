'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface ScholarshipMatch {
  id: string;
  name: string;
  provider: string;
  country: string | null;
  category: string | null;
  deadline: string | null;
  amount: number | null;
  currency: string | null;
  matchScore: number;
  matchReasons: string[];
  isEligible: boolean;
  daysUntilDeadline: number;
}

function matchColor(score: number) {
  if (score >= 70) return 'text-green-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-orange-400';
}

function matchBg(score: number) {
  if (score >= 70) return 'from-green-500/20 to-green-500/5';
  if (score >= 40) return 'from-yellow-500/20 to-yellow-500/5';
  return 'from-orange-500/20 to-orange-500/5';
}

function formatDate(d: string | null) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ScholarshipMatchPage() {
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ country: string; educationLevel: string } | null>(null);

  useEffect(() => {
    apiClient.get<{ success: boolean; data: { matches: ScholarshipMatch[]; total: number; userProfile: { country: string; educationLevel: string } } }>('/api/education/scholarships/match')
      .then((res) => {
        setMatches(res.data.matches);
        setUserProfile(res.data.userProfile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/education/scholarships" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Scholarships
          </Link>
          <h1 className="text-2xl font-bold gradient-text">Scholarship Auto-Matcher</h1>
          <p className="text-gray-400 text-sm mt-1">
            Scholarships matched to your profile
            {userProfile && (
              <span className="text-gray-500">
                {' '}({userProfile.country}{userProfile.educationLevel ? ` · ${userProfile.educationLevel}` : ''})
              </span>
            )}
          </p>
        </div>
        <Link href="/education/scholarships" className="text-sm text-blue-400 hover:underline">
          Browse all scholarships
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-4">&#128269;</p>
          <h3 className="text-lg font-semibold text-white mb-2">No matches found</h3>
          <p className="text-gray-400 text-sm">
            Update your profile with country and education level to get personalized matches.
          </p>
          <Link href="/profile" className="mt-4 inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
            Update Profile
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {matches.map((s) => (
            <Link
              key={s.id}
              href={`/education/scholarships/${s.id}`}
              className="block bg-card border border-border/50 rounded-2xl p-5 hover:border-blue-500/30 transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white truncate">{s.name}</h3>
                    {!s.isEligible && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-300">Ineligible</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{s.provider} {s.country ? `· ${s.country}` : ''}</p>

                  {/* Match Reasons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {s.matchReasons.slice(0, 4).map((reason, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-dark/60 text-xs text-gray-300">
                        {reason}
                      </span>
                    ))}
                    {s.matchReasons.length > 4 && (
                      <span className="px-2 py-1 rounded-lg bg-dark/60 text-xs text-gray-500">
                        +{s.matchReasons.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Score */}
                <div className={`flex flex-col items-center px-4 py-3 rounded-xl bg-gradient-to-b ${matchBg(s.matchScore)}`}>
                  <span className={`text-2xl font-bold ${matchColor(s.matchScore)}`}>{s.matchScore}%</span>
                  <span className="text-xs text-gray-500">match</span>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-border/30">
                {s.amount && (
                  <span className="text-sm text-green-400 font-medium">
                    {s.currency || 'PKR'} {s.amount.toLocaleString()}
                  </span>
                )}
                {s.category && (
                  <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-xs text-blue-300">{s.category}</span>
                )}
                <span className={`text-sm ml-auto ${s.daysUntilDeadline <= 7 ? 'text-red-400 font-bold' : s.daysUntilDeadline <= 14 ? 'text-yellow-400' : 'text-gray-400'}`}>
                  Deadline: {formatDate(s.deadline)} ({s.daysUntilDeadline}d)
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
