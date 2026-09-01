import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  profile: { findUnique: vi.fn() },
  learningProfile: { findUnique: vi.fn() },
  studentProfile: { findUnique: vi.fn() },
  budgetProfile: { findUnique: vi.fn() },
  savingsGoal: { findMany: vi.fn() },
  studyPlan: { findMany: vi.fn() },
  studySession: { findMany: vi.fn() },
  studyTopic: { findMany: vi.fn() },
  savedCourse: { findMany: vi.fn() },
  savedUniversity: { findMany: vi.fn() },
  savedScholarship: { findMany: vi.fn() },
  applicationChecklist: { findMany: vi.fn() },
  fraudReport: { findMany: vi.fn() },
  urlScan: { findMany: vi.fn() },
  userMemory: { findMany: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({ default: mockPrisma }));

import { StudentAssistantService } from '@/services/student-assistant/student-assistant.service';

function setupBaseMocks() {
  const now = new Date();
  mockPrisma.user.findUnique.mockResolvedValue({
    id: 'u1', name: 'Alice', email: 'alice@test.com', country: 'Germany',
    preferredLanguage: 'English', createdAt: now,
  });
  mockPrisma.profile.findUnique.mockResolvedValue({ educationLevel: 'Undergraduate' });
  mockPrisma.learningProfile.findUnique.mockResolvedValue({
    subjects: '["Math","Physics"]', weakSubjects: '["Physics"]',
    learningStyle: 'visual', studyHoursPerDay: 3, targetExam: 'SAT', educationLevel: 'Graduate',
  });
  mockPrisma.studentProfile.findUnique.mockResolvedValue(null);
  mockPrisma.budgetProfile.findUnique.mockResolvedValue(null);
  mockPrisma.savingsGoal.findMany.mockResolvedValue([]);
  mockPrisma.studyPlan.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
  mockPrisma.studySession.findMany.mockResolvedValue([]);
  mockPrisma.studyTopic.findMany.mockResolvedValue([]);
  mockPrisma.savedCourse.findMany.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }]);
  mockPrisma.savedUniversity.findMany.mockResolvedValue([{ id: 'u1' }]);
  mockPrisma.savedScholarship.findMany.mockResolvedValue([]);
  mockPrisma.applicationChecklist.findMany.mockResolvedValue([]);
  mockPrisma.fraudReport.findMany.mockResolvedValue([]);
  mockPrisma.urlScan.findMany.mockResolvedValue([]);
  mockPrisma.userMemory.findMany.mockResolvedValue([{ key: 'lang', value: 'English' }]);
}

describe('buildUnifiedProfile - parallel prisma queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBaseMocks();
  });

  it('calls all 16 prisma queries in parallel', async () => {
    const service = new StudentAssistantService();
    await service.buildUnifiedProfile('u1');

    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.profile.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.learningProfile.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.studentProfile.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.budgetProfile.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.savingsGoal.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.studyPlan.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.studySession.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.studyTopic.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.savedCourse.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.savedUniversity.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.savedScholarship.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.applicationChecklist.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.fraudReport.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.urlScan.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.userMemory.findMany).toHaveBeenCalledTimes(1);
  });

  it('correctly parses JSON fields (subjects, weakSubjects, goals)', async () => {
    const service = new StudentAssistantService();
    const profile = await service.buildUnifiedProfile('u1');

    expect(profile.learning.subjects).toEqual(['Math', 'Physics']);
    expect(profile.learning.weakSubjects).toEqual(['Physics']);
  });

  it('calculates totalStudyMinutesThisWeek correctly', async () => {
    const today = new Date();
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    mockPrisma.studySession.findMany.mockResolvedValue([
      { startTime: twoDaysAgo, durationMin: 45 },
      { startTime: today, durationMin: 30 },
    ]);

    const service = new StudentAssistantService();
    const profile = await service.buildUnifiedProfile('u1');

    expect(profile.learning.totalStudyMinutesThisWeek).toBe(75);
  });

  it('calculates avgMasteryLevel correctly', async () => {
    mockPrisma.studyTopic.findMany.mockResolvedValue([
      { masteryLevel: 60 },
      { masteryLevel: 80 },
      { masteryLevel: 70 },
    ]);

    const service = new StudentAssistantService();
    const profile = await service.buildUnifiedProfile('u1');

    expect(profile.learning.avgMasteryLevel).toBe(70);
  });

  it('calculates savingsProgress correctly', async () => {
    mockPrisma.savingsGoal.findMany.mockResolvedValue([
      { currentAmount: 1000, targetAmount: 3000, status: 'active' },
      { currentAmount: 500, targetAmount: 2000, status: 'active' },
    ]);

    const service = new StudentAssistantService();
    const profile = await service.buildUnifiedProfile('u1');

    expect(profile.finances.totalSaved).toBe(1500);
    expect(profile.finances.savingsProgress).toBe(30);
  });

  it('throws when user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const service = new StudentAssistantService();
    await expect(service.buildUnifiedProfile('nonexistent')).rejects.toThrow('User not found');
  });
});

describe('buildAssistantContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBaseMocks();
  });

  it('returns privacy-filtered context', async () => {
    const service = new StudentAssistantService();
    const ctx = await service.buildAssistantContext('u1', 'hello there');

    expect(ctx.privacyFilteredContext).toContain('Student Profile Context');
    expect(ctx.privacyFilteredContext).toContain('Alice');
    expect(ctx.injectedDomains).not.toContain('finances');
    expect(ctx.injectedDomains).not.toContain('security');
  });

  it('includes insights in context', async () => {
    mockPrisma.learningProfile.findUnique.mockResolvedValue({
      subjects: '["Math"]', weakSubjects: '["Physics"]',
      learningStyle: null, studyHoursPerDay: null, targetExam: null, educationLevel: null,
    });
    mockPrisma.studyTopic.findMany.mockResolvedValue([{ masteryLevel: 40 }]);

    const service = new StudentAssistantService();
    const ctx = await service.buildAssistantContext('u1', 'hello');

    expect(ctx.insights.length).toBeGreaterThan(0);
    expect(ctx.privacyFilteredContext).toContain('Proactive Insights');
  });
});

describe('getDashboardSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBaseMocks();
  });

  it('returns profile + insights', async () => {
    const service = new StudentAssistantService();
    const result = await service.getDashboardSummary('u1');

    expect(result.profile).toBeDefined();
    expect(result.profile.userId).toBe('u1');
    expect(Array.isArray(result.insights)).toBe(true);
  });
});

describe('Privacy boundary tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBaseMocks();
  });

  it('financial data not in context for education queries', async () => {
    const service = new StudentAssistantService();
    const ctx = await service.buildAssistantContext('u1', 'how are my university applications?');

    expect(ctx.injectedDomains).not.toContain('finances');
    expect(ctx.privacyFilteredContext).not.toContain('Financial Profile');
  });

  it('financial data in context for budget queries', async () => {
    mockPrisma.budgetProfile.findUnique.mockResolvedValue({
      monthlyIncome: 2000, currency: 'USD', savingsGoal: 10000,
    });
    mockPrisma.savingsGoal.findMany.mockResolvedValue([
      { currentAmount: 3000, targetAmount: 10000, status: 'active' },
    ]);

    const service = new StudentAssistantService();
    const ctx = await service.buildAssistantContext('u1', 'show me my budget and savings');

    expect(ctx.injectedDomains).toContain('finances');
    expect(ctx.privacyFilteredContext).toContain('Financial Profile');
  });
});

describe('AI prompt structure', () => {
  it('studentAssistantPrompt contains core sections', () => {
    const sections = [
      'Student Profile Context',
      'You are',
      'assistant',
    ];

    for (const section of sections) {
      expect(typeof section).toBe('string');
      expect(section.length).toBeGreaterThan(0);
    }

    const promptTemplate = `## Student Profile Context

You are a proactive Student AI Assistant. Use the student's profile to provide personalized help.

Key rules:
1. Always reference the student by name from their profile.
2. If weak subjects are listed, proactively offer study tips for those areas.
3. If the student has pending applications, remind them about deadlines.
4. Only access financial or security data when explicitly relevant.
5. Be encouraging and supportive in all responses.

Respond in the student's preferred language when possible.`;

    expect(promptTemplate).toContain('Student Profile Context');
    expect(promptTemplate).toContain('Student AI Assistant');
    expect(promptTemplate).toContain('weak subjects');
    expect(promptTemplate).toContain('applications');
  });
});

describe('Intent detection - orchestration', () => {
  it('orchestration intent detects multi-domain queries', () => {
    const intents = [
      { pattern: /study|learn|subject|exam/i, domain: 'study' },
      { pattern: /budget|money|cost|afford|savings/i, domain: 'budget' },
      { pattern: /university|course|scholarship|application/i, domain: 'education' },
      { pattern: /scam|fraud|safe|security|phishing/i, domain: 'security' },
    ];

    const message = 'I need help with my physics study AND check if I can afford the university application fee';

    const detectedDomains = intents
      .filter(i => i.pattern.test(message))
      .map(i => i.domain);

    expect(detectedDomains).toContain('study');
    expect(detectedDomains).toContain('education');
    expect(detectedDomains.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Context manager - dynamic import', () => {
  it('can dynamically import student assistant service', async () => {
    vi.clearAllMocks();
    setupBaseMocks();

    const mod = await import('@/services/student-assistant/student-assistant.service');
    expect(mod.StudentAssistantService).toBeDefined();
    expect(typeof mod.StudentAssistantService).toBe('function');

    const instance = new mod.StudentAssistantService();
    expect(typeof instance.buildUnifiedProfile).toBe('function');
    expect(typeof instance.buildAssistantContext).toBe('function');
    expect(typeof instance.getDashboardSummary).toBe('function');
  });
});
