import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const mock = {
    $transaction: vi.fn((fns: unknown[]) => Promise.all(fns)),
    studySession: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    studyTopic: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    dailySchedule: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    studyPlan: {
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
import { StudyService } from '@/services/study/study.service';

const mockedPrisma = vi.mocked(prisma);

describe('StudyService', () => {
  let service: StudyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StudyService();
  });

  describe('logStudySession', () => {
    it('creates session and updates mastery when topic exists', async () => {
      const session = { id: 's1', userId: 'u1', subject: 'Math', topic: 'Algebra', durationMin: 30 };
      mockedPrisma.studySession.create.mockResolvedValue(session as never);
      mockedPrisma.studyTopic.findUnique.mockResolvedValue({
        id: 't1', userId: 'u1', subject: 'Math', topic: 'Algebra', masteryLevel: 40,
      } as never);
      mockedPrisma.studyTopic.update.mockResolvedValue({} as never);

      const result = await service.logStudySession('u1', {
        subject: 'Math',
        topic: 'Algebra',
        durationMin: 30,
        startTime: new Date(),
      });

      expect(result.id).toBe('s1');
      expect(mockedPrisma.studyTopic.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { masteryLevel: 43, lastStudiedAt: expect.any(Date) },
      });
    });

    it('creates new topic with mastery 1 when topic not found', async () => {
      const session = { id: 's2', userId: 'u1', subject: 'Science', topic: 'Physics' };
      mockedPrisma.studySession.create.mockResolvedValue(session as never);
      mockedPrisma.studyTopic.findUnique.mockResolvedValue(null);

      await service.logStudySession('u1', {
        subject: 'Science',
        topic: 'Physics',
        durationMin: 45,
        startTime: new Date(),
      });

      expect(mockedPrisma.studyTopic.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          subject: 'Science',
          topic: 'Physics',
          masteryLevel: 1,
          lastStudiedAt: expect.any(Date),
        },
      });
    });

    it('does not touch mastery when no topic is provided', async () => {
      const session = { id: 's3', userId: 'u1', subject: 'Math', durationMin: 20 };
      mockedPrisma.studySession.create.mockResolvedValue(session as never);

      await service.logStudySession('u1', {
        subject: 'Math',
        durationMin: 20,
        startTime: new Date(),
      });

      expect(mockedPrisma.studyTopic.findUnique).not.toHaveBeenCalled();
      expect(mockedPrisma.studyTopic.create).not.toHaveBeenCalled();
      expect(mockedPrisma.studyTopic.update).not.toHaveBeenCalled();
    });

    it('caps mastery at 100', async () => {
      mockedPrisma.studySession.create.mockResolvedValue({ id: 's4' } as never);
      mockedPrisma.studyTopic.findUnique.mockResolvedValue({
        id: 't1', masteryLevel: 99,
      } as never);
      mockedPrisma.studyTopic.update.mockResolvedValue({} as never);

      await service.logStudySession('u1', {
        subject: 'Math',
        topic: 'Algebra',
        durationMin: 10,
        startTime: new Date(),
      });

      expect(mockedPrisma.studyTopic.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { masteryLevel: 100, lastStudiedAt: expect.any(Date) },
      });
    });
  });

  describe('getStudySessions', () => {
    it('returns paginated sessions', async () => {
      const sessions = [{ id: 's1', subject: 'Math' }, { id: 's2', subject: 'Science' }];
      mockedPrisma.$transaction.mockResolvedValue([sessions, 2]);

      const result = await service.getStudySessions('u1', { page: 1, pageSize: 10 });

      expect(result.sessions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('filters by subject when provided', async () => {
      mockedPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.getStudySessions('u1', { subject: 'Math' });

      const txCalls = mockedPrisma.$transaction.mock.calls[0][0] as unknown[];
      expect(txCalls).toHaveLength(2);
    });

    it('defaults to page 1 and pageSize 20', async () => {
      mockedPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.getStudySessions('u1');

      expect(mockedPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('getStudyTopics', () => {
    it('returns topics for user', async () => {
      const topics = [{ id: 't1', subject: 'Math', topic: 'Algebra', masteryLevel: 50 }];
      mockedPrisma.studyTopic.findMany.mockResolvedValue(topics as never);

      const result = await service.getStudyTopics('u1');

      expect(result).toEqual(topics);
      expect(mockedPrisma.studyTopic.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: [{ priority: 'asc' }, { masteryLevel: 'asc' }],
      });
    });

    it('filters by subject when provided', async () => {
      mockedPrisma.studyTopic.findMany.mockResolvedValue([]);

      await service.getStudyTopics('u1', 'Science');

      expect(mockedPrisma.studyTopic.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', subject: 'Science' },
        orderBy: [{ priority: 'asc' }, { masteryLevel: 'asc' }],
      });
    });
  });

  describe('upsertStudyTopic', () => {
    it('creates or updates a topic', async () => {
      const topic = { id: 't1', userId: 'u1', subject: 'Math', topic: 'Calculus', priority: 'high', masteryLevel: 0 };
      mockedPrisma.studyTopic.upsert.mockResolvedValue(topic as never);

      const result = await service.upsertStudyTopic('u1', 'Math', 'Calculus', 'high');

      expect(mockedPrisma.studyTopic.upsert).toHaveBeenCalledWith({
        where: { userId_subject_topic: { userId: 'u1', subject: 'Math', topic: 'Calculus' } },
        create: {
          userId: 'u1',
          subject: 'Math',
          topic: 'Calculus',
          priority: 'high',
        },
        update: { priority: 'high' },
      });
      expect(result.priority).toBe('high');
    });

    it('defaults priority to medium when not provided', async () => {
      mockedPrisma.studyTopic.upsert.mockResolvedValue({ priority: 'medium' } as never);

      await service.upsertStudyTopic('u1', 'Math', 'Algebra');

      expect(mockedPrisma.studyTopic.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ priority: 'medium' }),
        })
      );
    });
  });

  describe('getDailySchedule', () => {
    it('returns schedule entries for date', async () => {
      const entries = [{ id: 'd1', userId: 'u1', subject: 'Math', startTime: '09:00' }];
      mockedPrisma.dailySchedule.findMany.mockResolvedValue(entries as never);

      const date = new Date('2025-03-15');
      const result = await service.getDailySchedule('u1', date);

      expect(result).toEqual(entries);
      expect(mockedPrisma.dailySchedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'u1' }),
          orderBy: { startTime: 'asc' },
        })
      );
    });
  });

  describe('createDailySchedule', () => {
    it('creates a schedule entry', async () => {
      const entry = { id: 'd1', userId: 'u1', subject: 'Math', startTime: '09:00', endTime: '10:00', activity: 'Study' };
      mockedPrisma.dailySchedule.create.mockResolvedValue(entry as never);

      const result = await service.createDailySchedule('u1', {
        date: new Date(),
        subject: 'Math',
        startTime: '09:00',
        endTime: '10:00',
        activity: 'Study',
      });

      expect(mockedPrisma.dailySchedule.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          planId: undefined,
          date: expect.any(Date),
          subject: 'Math',
          startTime: '09:00',
          endTime: '10:00',
          activity: 'Study',
        },
      });
      expect(result.id).toBe('d1');
    });
  });

  describe('getWeeklyStudySummary', () => {
    it('calculates totals correctly for given week', async () => {
      const weekStart = new Date('2025-03-10');
      const sessions = [
        { id: 's1', subject: 'Math', durationMin: 60 },
        { id: 's2', subject: 'Math', durationMin: 30 },
        { id: 's3', subject: 'Science', durationMin: 45 },
      ];
      mockedPrisma.studySession.findMany.mockResolvedValue(sessions as never);

      const result = await service.getWeeklyStudySummary('u1', weekStart);

      expect(result.totalMinutes).toBe(135);
      expect(result.totalSessions).toBe(3);
      expect(result.subjectBreakdown).toHaveLength(2);
      const mathBreakdown = result.subjectBreakdown.find((s) => s.subject === 'Math');
      expect(mathBreakdown).toEqual({ subject: 'Math', minutes: 90, sessions: 2 });
      const scienceBreakdown = result.subjectBreakdown.find((s) => s.subject === 'Science');
      expect(scienceBreakdown).toEqual({ subject: 'Science', minutes: 45, sessions: 1 });
    });

    it('returns zeros when no sessions in week', async () => {
      mockedPrisma.studySession.findMany.mockResolvedValue([]);

      const result = await service.getWeeklyStudySummary('u1', new Date('2025-03-10'));

      expect(result.totalMinutes).toBe(0);
      expect(result.totalSessions).toBe(0);
      expect(result.subjectBreakdown).toEqual([]);
    });
  });

  describe('deleteStudyPlan', () => {
    it('deletes plan with ownership check', async () => {
      mockedPrisma.studyPlan.findFirst.mockResolvedValue({ id: 'p1', userId: 'u1' } as never);
      mockedPrisma.studyPlan.delete.mockResolvedValue({} as never);

      await service.deleteStudyPlan('p1', 'u1');

      expect(mockedPrisma.studyPlan.findFirst).toHaveBeenCalledWith({
        where: { id: 'p1', userId: 'u1' },
      });
      expect(mockedPrisma.studyPlan.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });

    it('throws when plan not found or wrong userId', async () => {
      mockedPrisma.studyPlan.findFirst.mockResolvedValue(null);

      await expect(service.deleteStudyPlan('p1', 'wrong-user')).rejects.toThrow('Study plan not found or access denied');
      expect(mockedPrisma.studyPlan.delete).not.toHaveBeenCalled();
    });
  });
});
