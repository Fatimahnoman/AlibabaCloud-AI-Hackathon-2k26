'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import type { UnifiedStudentProfile, ProactiveInsight } from '@/services/student-assistant/types';

interface DashboardData {
  profile: UnifiedStudentProfile;
  insights: ProactiveInsight[];
}

const INSIGHT_ICONS: Record<ProactiveInsight['type'], string> = {
  reminder: '\u23F0',
  suggestion: '\uD83D\uDCA1',
  warning: '\u26A0\uFE0F',
  celebration: '\uD83C\uDF89',
  nudge: '\uD83D\uDC49',
};

const RISK_COLORS: Record<string, string> = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-red-600 bg-red-100',
  critical: 'text-red-800 bg-red-200',
};

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/student-assistant');
        if (!res.ok) throw new Error('Failed to load dashboard');
        setData(await res.json());
      } catch {
        setError('Failed to load student dashboard data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error || 'No data available'}</p>
        <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const { profile, insights } = data;
  const weeklyHours = Math.round(profile.learning.totalStudyMinutesThisWeek / 60 * 10) / 10;
  const weeklySessions = Math.round(profile.learning.totalStudyMinutesThisWeek / 25);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Welcome back, {profile.identity.name}</h1>
        <p className="text-gray-500 mt-1">
          {profile.identity.educationLevel || 'Student'}
          {profile.education.targetCountry ? ` \u2022 Target: ${profile.education.targetField || 'Studies'} in ${profile.education.targetCountry}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <p className="text-sm text-gray-500">Study Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{weeklyHours}h</p>
          <p className="text-xs text-gray-400 mt-1">this week &middot; {profile.learning.topicsTracked} topics tracked</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Education Goals</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{profile.education.savedUniversities}</p>
          <p className="text-xs text-gray-400 mt-1">
            universities &middot; {profile.education.savedScholarships} scholarships &middot; {profile.education.savedCourses} courses
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Financial Status</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {profile.finances.hasProfile && profile.finances.monthlyIncome
              ? `${profile.finances.currency || 'USD'} ${profile.finances.monthlyIncome}`
              : 'Not set'}
          </p>
          {profile.finances.hasProfile && profile.finances.savingsProgress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(profile.finances.savingsProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{profile.finances.savingsProgress}% savings goal</p>
            </div>
          )}
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Security</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{profile.security.totalScans}</p>
          <p className="text-xs text-gray-400 mt-1">
            total scans &middot;{' '}
            {profile.security.recentRiskLevel ? (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${RISK_COLORS[profile.security.recentRiskLevel] || 'text-gray-400 bg-white/5'}`}>
                {profile.security.recentRiskLevel} risk
              </span>
            ) : (
              <span className="text-gray-400">no scans yet</span>
            )}
          </p>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Proactive Insights</h2>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 border border-white/10 rounded-lg p-3">
                <span className="text-xl mt-0.5">{INSIGHT_ICONS[insight.type]}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-100">{insight.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{insight.message}</p>
                </div>
                {insight.actionUrl && (
                  <Link
                    href={insight.actionUrl}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap mt-1"
                  >
                    {insight.actionLabel || 'View'}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.education.applicationChecklists.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Application Progress</h2>
          <div className="space-y-3">
            {profile.education.applicationChecklists.map((app, idx) => (
              <div key={idx} className="border border-white/10 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-gray-100">{app.title}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    app.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                    app.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    'bg-white/5 text-gray-200'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${app.progress}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{app.progress}% complete</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Learning Overview</h2>
          {profile.learning.weakSubjects.length === 0 ? (
            <p className="text-gray-500 text-sm">No weak subjects identified yet. Start studying to track mastery.</p>
          ) : (
            <div className="space-y-3">
              {profile.learning.weakSubjects.slice(0, 5).map((subject) => (
                <div key={subject} className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-100">{subject}</p>
                    <span className="text-xs text-red-600 font-semibold">Weak</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active study plans</span>
              <span className="font-medium text-gray-100">{profile.learning.activePlanCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Avg mastery</span>
              <span className="font-medium text-gray-100">{profile.learning.avgMasteryLevel}%</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Weekly Study Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">{weeklyHours}</p>
              <p className="text-xs text-gray-500">Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{weeklySessions}</p>
              <p className="text-xs text-gray-500">Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{profile.learning.subjects.length}</p>
              <p className="text-xs text-gray-500">Subjects</p>
            </div>
          </div>
          {profile.learning.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.learning.subjects.map((s) => (
                <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link href="/study-planner/timer" className="card p-4 text-center hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-2">{'\u23F1\uFE0F'}</div>
            <p className="text-sm font-medium text-gray-100">Study Timer</p>
          </Link>
          <Link href="/budget" className="card p-4 text-center hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-2">{'\uD83D\uDCB0'}</div>
            <p className="text-sm font-medium text-gray-100">Budget Overview</p>
          </Link>
          <Link href="/education/plan" className="card p-4 text-center hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-2">{'\uD83C\uDF93'}</div>
            <p className="text-sm font-medium text-gray-100">Education Plan</p>
          </Link>
          <Link href="/verification" className="card p-4 text-center hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-2">{'\u2705'}</div>
            <p className="text-sm font-medium text-gray-100">Verify Sources</p>
          </Link>
          <Link href="/fraud/check-text" className="card p-4 text-center hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-2">{'\uD83D\uDEE1\uFE0F'}</div>
            <p className="text-sm font-medium text-gray-100">Fraud Check</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
