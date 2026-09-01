import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  practiceQuiz: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  performanceMetric: { create: vi.fn() },
  studyTopic: { findFirst: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  studySession: { findMany: vi.fn() },
  revisionPlan: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({ default: mockPrisma }));

import { PerformanceIntelligenceService } from '@/services/study/performance-intelligence.service';

describe('PerformanceIntelligenceService', () => {
  let service: PerformanceIntelligenceService;
  const userId = 'user-1';

  const makeQuizResult = (overrides: Record<string, unknown> = {}) => ({
    id: 'q1', userId, subject: 'Math', topic: 'Algebra', title: 'Quiz 1',
    totalMarks: 100, scoredMarks: 80, percentage: 80, timeTakenMin: null,
    questionsJson: '[]', notes: null, studiedAt: new Date(), createdAt: new Date(),
    ...overrides,
  });

  const makeRevisionResult = (overrides: Record<string, unknown> = {}) => ({
    id: 'r1', userId, subject: 'Math', topic: 'Algebra', masteryAtCreation: 30,
    revisionCount: 0, nextRevision: new Date(Date.now() + 86400000), status: 'pending',
    notes: null, createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    service = new PerformanceIntelligenceService();
    vi.clearAllMocks();
  });

  describe('logQuiz', () => {
    it('creates quiz with correct percentage', async () => {
      mockPrisma.practiceQuiz.create.mockResolvedValue(makeQuizResult());
      mockPrisma.performanceMetric.create.mockResolvedValue({});
      const result = await service.logQuiz(userId, { subject: 'Math', topic: 'Algebra', title: 'Quiz 1', totalMarks: 100, scoredMarks: 80 });
      expect(result.percentage).toBe(80);
    });

    it('creates performance metric', async () => {
      mockPrisma.practiceQuiz.create.mockResolvedValue(makeQuizResult());
      mockPrisma.performanceMetric.create.mockResolvedValue({});
      await service.logQuiz(userId, { subject: 'Math', topic: 'Algebra', title: 'Quiz 1', totalMarks: 100, scoredMarks: 80 });
      expect(mockPrisma.performanceMetric.create).toHaveBeenCalled();
    });

    it('increases mastery when score >= 80', async () => {
      mockPrisma.practiceQuiz.create.mockResolvedValue(makeQuizResult({ percentage: 90 }));
      mockPrisma.performanceMetric.create.mockResolvedValue({});
      mockPrisma.studyTopic.findFirst.mockResolvedValue({ id: 't1', masteryLevel: 60 });
      mockPrisma.studyTopic.update.mockResolvedValue({});
      await service.logQuiz(userId, { subject: 'Math', topic: 'Algebra', title: 'Quiz 1', totalMarks: 100, scoredMarks: 90 });
      expect(mockPrisma.studyTopic.update).toHaveBeenCalled();
    });

    it('flags for revision when score < 50', async () => {
      mockPrisma.practiceQuiz.create.mockResolvedValue(makeQuizResult({ percentage: 30, scoredMarks: 30 }));
      mockPrisma.performanceMetric.create.mockResolvedValue({});
      mockPrisma.revisionPlan.findFirst.mockResolvedValue(null);
      mockPrisma.revisionPlan.create.mockResolvedValue(makeRevisionResult());
      await service.logQuiz(userId, { subject: 'Math', topic: 'Algebra', title: 'Quiz 1', totalMarks: 100, scoredMarks: 30 });
      expect(mockPrisma.revisionPlan.create).toHaveBeenCalled();
    });

    it('does not touch mastery when score is between 50-79', async () => {
      mockPrisma.practiceQuiz.create.mockResolvedValue(makeQuizResult({ percentage: 65 }));
      mockPrisma.performanceMetric.create.mockResolvedValue({});
      await service.logQuiz(userId, { subject: 'Math', topic: 'Algebra', title: 'Quiz 1', totalMarks: 100, scoredMarks: 65 });
      expect(mockPrisma.studyTopic.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('getQuizzes', () => {
    it('returns paginated quizzes', async () => {
      mockPrisma.practiceQuiz.findMany.mockResolvedValue([makeQuizResult()]);
      mockPrisma.practiceQuiz.count.mockResolvedValue(1);
      const result = await service.getQuizzes(userId, { page: 1, limit: 10 });
      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
    });

    it('filters by subject', async () => {
      mockPrisma.practiceQuiz.findMany.mockResolvedValue([]);
      mockPrisma.practiceQuiz.count.mockResolvedValue(0);
      await service.getQuizzes(userId, { subject: 'Math' });
      expect(mockPrisma.practiceQuiz.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ subject: 'Math' }) }));
    });

    it('filters by topic', async () => {
      mockPrisma.practiceQuiz.findMany.mockResolvedValue([]);
      mockPrisma.practiceQuiz.count.mockResolvedValue(0);
      await service.getQuizzes(userId, { topic: 'Algebra' });
      expect(mockPrisma.practiceQuiz.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ topic: 'Algebra' }) }));
    });
  });

  describe('flagForRevision', () => {
    it('creates new revision plan', async () => {
      mockPrisma.studyTopic.findFirst.mockResolvedValue({ masteryLevel: 30 });
      mockPrisma.revisionPlan.findFirst.mockResolvedValue(null);
      mockPrisma.revisionPlan.create.mockResolvedValue(makeRevisionResult());
      const result = await service.flagForRevision(userId, 'Math', 'Algebra');
      expect(result.subject).toBe('Math');
      expect(mockPrisma.revisionPlan.create).toHaveBeenCalled();
    });

    it('updates existing revision plan', async () => {
      mockPrisma.studyTopic.findFirst.mockResolvedValue({ masteryLevel: 30 });
      mockPrisma.revisionPlan.findFirst.mockResolvedValue({ id: 'r1', revisionCount: 1, notes: null });
      mockPrisma.revisionPlan.update.mockResolvedValue(makeRevisionResult({ revisionCount: 2 }));
      await service.flagForRevision(userId, 'Math', 'Algebra');
      expect(mockPrisma.revisionPlan.update).toHaveBeenCalled();
    });
  });

  describe('getRevisionPlans', () => {
    it('returns all revision plans', async () => {
      mockPrisma.revisionPlan.findMany.mockResolvedValue([makeRevisionResult()]);
      const result = await service.getRevisionPlans(userId);
      expect(result.length).toBe(1);
    });

    it('filters by status', async () => {
      mockPrisma.revisionPlan.findMany.mockResolvedValue([]);
      await service.getRevisionPlans(userId, { status: 'pending' });
      expect(mockPrisma.revisionPlan.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ status: 'pending' }) }));
    });
  });

  describe('updateRevisionStatus', () => {
    it('updates status', async () => {
      mockPrisma.revisionPlan.findFirst.mockResolvedValue({ id: 'r1', userId });
      mockPrisma.revisionPlan.update.mockResolvedValue(makeRevisionResult({ status: 'completed' }));
      const result = await service.updateRevisionStatus('r1', userId, 'completed');
      expect(result.status).toBe('completed');
    });

    it('throws when not found', async () => {
      mockPrisma.revisionPlan.findFirst.mockResolvedValue(null);
      await expect(service.updateRevisionStatus('x', userId, 'completed')).rejects.toThrow('Revision plan not found');
    });
  });

  describe('deleteRevisionPlan', () => {
    it('deletes and returns true', async () => {
      mockPrisma.revisionPlan.findFirst.mockResolvedValue({ id: 'r1', userId });
      mockPrisma.revisionPlan.delete.mockResolvedValue({});
      const result = await service.deleteRevisionPlan('r1', userId);
      expect(result).toBe(true);
    });

    it('returns false when not found', async () => {
      mockPrisma.revisionPlan.findFirst.mockResolvedValue(null);
      const result = await service.deleteRevisionPlan('x', userId);
      expect(result).toBe(false);
    });
  });

  describe('getPerformanceOverview', () => {
    it('returns empty overview when no data', async () => {
      mockPrisma.studyTopic.findMany.mockResolvedValue([]);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      mockPrisma.practiceQuiz.findMany.mockResolvedValue([]);
      mockPrisma.revisionPlan.findMany.mockResolvedValue([]);
      const result = await service.getPerformanceOverview(userId);
      expect(result.subjects.length).toBe(0);
      expect(result.totalStudyMinutes).toBe(0);
      expect(result.totalQuizzes).toBe(0);
    });

    it('calculates total study minutes', async () => {
      mockPrisma.studyTopic.findMany.mockResolvedValue([]);
      mockPrisma.studySession.findMany.mockResolvedValue([
        { subject: 'Math', durationMin: 30, startTime: new Date(), rating: 4, topic: 'Algebra' },
        { subject: 'Math', durationMin: 45, startTime: new Date(), rating: 5, topic: 'Geometry' },
      ]);
      mockPrisma.practiceQuiz.findMany.mockResolvedValue([]);
      mockPrisma.revisionPlan.findMany.mockResolvedValue([]);
      const result = await service.getPerformanceOverview(userId);
      expect(result.totalStudyMinutes).toBe(75);
    });

    it('identifies strengths for high quiz scores', async () => {
      mockPrisma.studyTopic.findMany.mockResolvedValue([]);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      mockPrisma.practiceQuiz.findMany.mockResolvedValue([
        { subject: 'Math', topic: 'Algebra', percentage: 90, studiedAt: new Date() },
      ]);
      mockPrisma.revisionPlan.findMany.mockResolvedValue([]);
      const result = await service.getPerformanceOverview(userId);
      expect(result.diagnostic.strengths.length).toBeGreaterThan(0);
    });

    it('identifies weaknesses for low mastery', async () => {
      mockPrisma.studyTopic.findMany.mockResolvedValue([
        { subject: 'Math', topic: 'Algebra', masteryLevel: 20, lastStudiedAt: new Date() },
      ]);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      mockPrisma.practiceQuiz.findMany.mockResolvedValue([]);
      mockPrisma.revisionPlan.findMany.mockResolvedValue([]);
      const result = await service.getPerformanceOverview(userId);
      expect(result.diagnostic.weaknesses.length).toBeGreaterThan(0);
    });

    it('marks overdue revisions', async () => {
      mockPrisma.studyTopic.findMany.mockResolvedValue([]);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      mockPrisma.practiceQuiz.findMany.mockResolvedValue([]);
      mockPrisma.revisionPlan.findMany.mockResolvedValue([
        makeRevisionResult({ nextRevision: new Date(Date.now() - 86400000), status: 'pending' }),
      ]);
      const result = await service.getPerformanceOverview(userId);
      expect(result.overdueRevisions).toBe(1);
    });
  });
});
