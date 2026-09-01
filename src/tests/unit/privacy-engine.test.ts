import { describe, it, expect, vi } from 'vitest';
import type { UnifiedStudentProfile } from '@/services/student-assistant/types';

vi.mock('@/lib/prisma', () => ({ default: {} }));

import { PrivacyEngine } from '@/services/student-assistant/privacy-engine';

const mockProfile: UnifiedStudentProfile = {
  userId: 'user-1',
  identity: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    country: 'Germany',
    preferredLanguage: 'English',
    educationLevel: 'Undergraduate',
  },
  learning: {
    subjects: ['Mathematics', 'Physics', 'Computer Science'],
    weakSubjects: ['Physics'],
    learningStyle: 'visual',
    studyHoursPerDay: 3,
    targetExam: 'SAT',
    activePlanCount: 2,
    totalStudyMinutesThisWeek: 300,
    topicsTracked: 15,
    avgMasteryLevel: 72,
  },
  education: {
    savedCourses: 5,
    savedUniversities: 3,
    savedScholarships: 2,
    applicationChecklists: [
      { title: 'MIT Application', status: 'in_progress', progress: 40 },
    ],
    targetCountry: 'USA',
    targetField: 'Computer Science',
  },
  finances: {
    hasProfile: true,
    monthlyIncome: 1200,
    currency: 'EUR',
    savingsGoal: 5000,
    activeSavingsGoals: 2,
    totalSaved: 1800,
    savingsProgress: 36,
  },
  security: {
    totalScans: 10,
    recentRiskLevel: 'medium',
    unresolvedReports: 2,
  },
  memory: { preferred_study_time: 'morning', notes: 'focus on calculus' },
};

describe('PrivacyEngine - filterProfile', () => {
  it('injects identity, learning, education, and memory always', () => {
    const engine = new PrivacyEngine();
    const { filtered, injectedDomains } = engine.filterProfile(mockProfile, 'hello there');

    expect(filtered.identity).toEqual(mockProfile.identity);
    expect(filtered.learning).toEqual(mockProfile.learning);
    expect(filtered.education).toEqual(mockProfile.education);
    expect(filtered.memory).toEqual(mockProfile.memory);
    expect(injectedDomains).toContain('identity');
    expect(injectedDomains).toContain('learning');
    expect(injectedDomains).toContain('education');
    expect(injectedDomains).toContain('memory');
  });

  it('does NOT inject finances when message is "tell me about Germany"', () => {
    const engine = new PrivacyEngine();
    const { filtered, injectedDomains } = engine.filterProfile(mockProfile, 'tell me about Germany');

    expect(filtered.finances).toBeUndefined();
    expect(injectedDomains).not.toContain('finances');
  });

  it('DOES inject finances when message is "can I afford this"', () => {
    const engine = new PrivacyEngine();
    const { filtered, injectedDomains } = engine.filterProfile(mockProfile, 'can I afford this university?');

    expect(filtered.finances).toEqual(mockProfile.finances);
    expect(injectedDomains).toContain('finances');
  });

  it('does NOT inject security when message is about education', () => {
    const engine = new PrivacyEngine();
    const { filtered, injectedDomains } = engine.filterProfile(mockProfile, 'how are my university applications doing?');

    expect(filtered.security).toBeUndefined();
    expect(injectedDomains).not.toContain('security');
  });

  it('DOES inject security when message is about scams', () => {
    const engine = new PrivacyEngine();
    const { filtered, injectedDomains } = engine.filterProfile(mockProfile, 'is this scholarship offer a scam?');

    expect(filtered.security).toEqual(mockProfile.security);
    expect(injectedDomains).toContain('security');
  });
});

describe('PrivacyEngine - shouldInjectDomain', () => {
  it('returns true for always-injected domains', () => {
    const engine = new PrivacyEngine();

    expect(engine.shouldInjectDomain('identity', 'any message')).toBe(true);
    expect(engine.shouldInjectDomain('learning', 'any message')).toBe(true);
    expect(engine.shouldInjectDomain('education', 'any message')).toBe(true);
    expect(engine.shouldInjectDomain('memory', 'any message')).toBe(true);
  });

  it('returns false for financial domain without keywords', () => {
    const engine = new PrivacyEngine();
    expect(engine.shouldInjectDomain('finances', 'tell me about Germany')).toBe(false);
  });

  it('returns true for financial domain with "budget" keyword', () => {
    const engine = new PrivacyEngine();
    expect(engine.shouldInjectDomain('finances', 'show me my budget')).toBe(true);
  });
});

describe('PrivacyEngine - formatFilteredContext', () => {
  it('returns formatted string with identity section', () => {
    const engine = new PrivacyEngine();
    const { filtered } = engine.filterProfile(mockProfile, 'hello');
    const result = engine.formatFilteredContext(filtered);

    expect(result).toContain('## Student Profile Context');
    expect(result).toContain('Alice Johnson');
    expect(result).toContain('alice@example.com');
    expect(result).toContain('Germany');
    expect(result).toContain('Undergraduate');
  });

  it('includes weak subjects when present', () => {
    const engine = new PrivacyEngine();
    const { filtered } = engine.filterProfile(mockProfile, 'hello');
    const result = engine.formatFilteredContext(filtered);

    expect(result).toContain('Weak Areas');
    expect(result).toContain('Physics');
  });

  it('includes financial data when present', () => {
    const engine = new PrivacyEngine();
    const { filtered } = engine.filterProfile(mockProfile, 'can I afford this?');
    const result = engine.formatFilteredContext(filtered);

    expect(result).toContain('Financial Profile');
    expect(result).toContain('1200');
    expect(result).toContain('EUR');
  });

  it('includes security data when present', () => {
    const engine = new PrivacyEngine();
    const { filtered } = engine.filterProfile(mockProfile, 'is this a scam?');
    const result = engine.formatFilteredContext(filtered);

    expect(result).toContain('Security Status');
    expect(result).toContain('Total Scans');
    expect(result).toContain('10');
    expect(result).toContain('Unresolved Reports');
  });
});
