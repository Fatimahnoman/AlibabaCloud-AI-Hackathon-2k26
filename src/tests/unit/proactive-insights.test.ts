import { describe, it, expect, vi } from 'vitest';
import type { UnifiedStudentProfile } from '@/services/student-assistant/types';

vi.mock('@/lib/prisma', () => ({ default: {} }));

import { ProactiveInsights } from '@/services/student-assistant/proactive-insights';

function makeProfile(overrides: Partial<UnifiedStudentProfile> = {}): UnifiedStudentProfile {
  return {
    userId: 'user-1',
    identity: { name: 'Alice', email: 'alice@example.com', preferredLanguage: 'English' },
    learning: {
      subjects: ['Math'],
      weakSubjects: [],
      activePlanCount: 1,
      totalStudyMinutesThisWeek: 60,
      topicsTracked: 5,
      avgMasteryLevel: 60,
    },
    education: {
      savedCourses: 2,
      savedUniversities: 1,
      savedScholarships: 0,
      applicationChecklists: [],
    },
    finances: {
      hasProfile: false,
      activeSavingsGoals: 0,
      totalSaved: 0,
      savingsProgress: 0,
    },
    security: { totalScans: 0, unresolvedReports: 0 },
    memory: {},
    ...overrides,
  };
}

describe('ProactiveInsights - generateInsights', () => {
  it('returns weak subjects nudge when weak subjects exist', async () => {
    const service = new ProactiveInsights();
    const profile = makeProfile({
      learning: {
        subjects: ['Math', 'Physics'],
        weakSubjects: ['Physics', 'Chemistry'],
        activePlanCount: 1,
        totalStudyMinutesThisWeek: 60,
        topicsTracked: 5,
        avgMasteryLevel: 60,
      },
    });

    const insights = await service.generateInsights(profile);
    const weakInsight = insights.find(i => i.id.startsWith('weak-subjects'));

    expect(weakInsight).toBeDefined();
    expect(weakInsight!.type).toBe('nudge');
    expect(weakInsight!.domain).toBe('study');
    expect(weakInsight!.message).toContain('2 weak subject(s)');
  });

  it('returns no-study reminder when 0 minutes this week', async () => {
    const service = new ProactiveInsights();
    const profile = makeProfile({
      learning: {
        subjects: ['Math'],
        weakSubjects: [],
        activePlanCount: 1,
        totalStudyMinutesThisWeek: 0,
        topicsTracked: 5,
        avgMasteryLevel: 50,
      },
    });

    const insights = await service.generateInsights(profile);
    const noStudy = insights.find(i => i.id.startsWith('no-study'));

    expect(noStudy).toBeDefined();
    expect(noStudy!.type).toBe('reminder');
    expect(noStudy!.actionUrl).toBe('/study-planner/timer');
  });

  it('returns celebration when mastery >= 80%', async () => {
    const service = new ProactiveInsights();
    const profile = makeProfile({
      learning: {
        subjects: ['Math'],
        weakSubjects: [],
        activePlanCount: 1,
        totalStudyMinutesThisWeek: 120,
        topicsTracked: 10,
        avgMasteryLevel: 85,
      },
    });

    const insights = await service.generateInsights(profile);
    const celebration = insights.find(i => i.id.startsWith('high-mastery'));

    expect(celebration).toBeDefined();
    expect(celebration!.type).toBe('celebration');
    expect(celebration!.message).toContain('85%');
  });

  it('returns pending applications reminder', async () => {
    const service = new ProactiveInsights();
    const profile = makeProfile({
      education: {
        savedCourses: 2,
        savedUniversities: 1,
        savedScholarships: 0,
        applicationChecklists: [
          { title: 'MIT App', status: 'in_progress', progress: 30 },
          { title: 'Stanford App', status: 'completed', progress: 100 },
        ],
      },
    });

    const insights = await service.generateInsights(profile);
    const appReminder = insights.find(i => i.id.startsWith('app-pending'));

    expect(appReminder).toBeDefined();
    expect(appReminder!.type).toBe('reminder');
    expect(appReminder!.message).toContain('1 application(s)');
  });

  it('returns savings nudge when progress < 50%', async () => {
    const service = new ProactiveInsights();
    const profile = makeProfile({
      finances: {
        hasProfile: true,
        monthlyIncome: 1000,
        currency: 'USD',
        savingsGoal: 5000,
        activeSavingsGoals: 1,
        totalSaved: 1500,
        savingsProgress: 30,
      },
    });

    const insights = await service.generateInsights(profile);
    const savingsNudge = insights.find(i => i.id.startsWith('savings-low'));

    expect(savingsNudge).toBeDefined();
    expect(savingsNudge!.type).toBe('nudge');
    expect(savingsNudge!.domain).toBe('budget');
    expect(savingsNudge!.message).toContain('30%');
  });

  it('returns security warning for unresolved reports', async () => {
    const service = new ProactiveInsights();
    const profile = makeProfile({
      security: { totalScans: 5, recentRiskLevel: 'high', unresolvedReports: 3 },
    });

    const insights = await service.generateInsights(profile);
    const secWarning = insights.find(i => i.id.startsWith('unresolved'));

    expect(secWarning).toBeDefined();
    expect(secWarning!.type).toBe('warning');
    expect(secWarning!.domain).toBe('security');
    expect(secWarning!.priority).toBe('high');
  });

  it('returns no actionable insights for perfect profile', async () => {
    const service = new ProactiveInsights();
    const profile = makeProfile({
      learning: {
        subjects: ['Math'],
        weakSubjects: [],
        activePlanCount: 1,
        totalStudyMinutesThisWeek: 300,
        topicsTracked: 10,
        avgMasteryLevel: 95,
      },
      education: {
        savedCourses: 5,
        savedUniversities: 3,
        savedScholarships: 2,
        applicationChecklists: [],
      },
      finances: {
        hasProfile: true,
        savingsProgress: 65,
        activeSavingsGoals: 1,
        totalSaved: 4500,
      },
      security: { totalScans: 10, unresolvedReports: 0 },
    });

    const insights = await service.generateInsights(profile);

    const actionable = insights.filter(i => i.type !== 'celebration');
    expect(actionable).toHaveLength(0);

    const celebrations = insights.filter(i => i.type === 'celebration');
    expect(celebrations.length).toBeGreaterThan(0);
  });

  it('sorts by priority (high first)', async () => {
    const service = new ProactiveInsights();
    const profile = makeProfile({
      learning: {
        subjects: ['Math'],
        weakSubjects: ['Physics'],
        activePlanCount: 1,
        totalStudyMinutesThisWeek: 0,
        topicsTracked: 5,
        avgMasteryLevel: 90,
      },
      education: {
        savedCourses: 2,
        savedUniversities: 0,
        savedScholarships: 0,
        applicationChecklists: [
          { title: 'App', status: 'in_progress', progress: 20 },
        ],
        targetCountry: 'USA',
      },
      security: { totalScans: 5, unresolvedReports: 1 },
    });

    const insights = await service.generateInsights(profile);

    const highPriority = insights.filter(i => i.priority === 'high');
    const lowPriority = insights.filter(i => i.priority === 'low');

    expect(highPriority.length).toBeGreaterThan(0);
    expect(lowPriority.length).toBeGreaterThan(0);

    const firstHighIdx = insights.indexOf(highPriority[0]);
    const lastLowIdx = insights.indexOf(lowPriority[lowPriority.length - 1]);
    expect(firstHighIdx).toBeLessThan(lastLowIdx);
  });
});
