import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const mock = {
    teacherLessonPlan: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    teacherAssessment: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    teacherHomework: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    teacherRubric: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
import { TeacherService } from '@/services/teacher/teacher.service';

const mockedPrisma = vi.mocked(prisma);

describe('TeacherService', () => {
  let service: TeacherService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TeacherService();
  });

  describe('generateLessonPlan', () => {
    it('creates lesson plan with structured content', async () => {
      const plan = {
        id: 'lp1', userId: 'u1', subject: 'Math', topic: 'Algebra', grade: '10th',
        durationMin: 60, content: '{}', objectives: '[]', materials: '[]', assessment: 'Test',
        createdAt: new Date(), updatedAt: new Date(),
      };
      mockedPrisma.teacherLessonPlan.create.mockResolvedValue(plan as never);

      const result = await service.generateLessonPlan('u1', 'Math', 'Algebra', '10th', 60);

      expect(result.id).toBe('lp1');
      expect(result.subject).toBe('Math');
      expect(result.topic).toBe('Algebra');
      expect(result.grade).toBe('10th');
      expect(result.durationMin).toBe(60);

      const createCall = mockedPrisma.teacherLessonPlan.create.mock.calls[0][0];
      const content = JSON.parse(createCall.data.content);
      expect(content).toHaveProperty('introduction');
      expect(content).toHaveProperty('mainContent');
      expect(content).toHaveProperty('activities');
      expect(content).toHaveProperty('conclusion');
      expect(content.introduction.title).toContain('Algebra');
    });

    it('generates correct objectives and materials', async () => {
      mockedPrisma.teacherLessonPlan.create.mockResolvedValue({
        id: 'lp2', objectives: '[]', materials: '[]', createdAt: new Date(), updatedAt: new Date(),
      } as never);

      await service.generateLessonPlan('u1', 'Science', 'Photosynthesis', '9th', 45);

      const createCall = mockedPrisma.teacherLessonPlan.create.mock.calls[0][0];
      const objectives = JSON.parse(createCall.data.objectives);
      expect(Array.isArray(objectives)).toBe(true);
      expect(objectives.length).toBe(3);
      expect(objectives[0]).toContain('Photosynthesis');

      const materials = JSON.parse(createCall.data.materials);
      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBe(3);
    });
  });

  describe('generateAssessment', () => {
    it('creates assessment with questions and answer key', async () => {
      const assessment = {
        id: 'a1', userId: 'u1', subject: 'Math', topic: 'Algebra', difficulty: 'medium',
        questionCount: 5, content: '{}', answerKey: '[]', createdAt: new Date(),
      };
      mockedPrisma.teacherAssessment.create.mockResolvedValue(assessment as never);

      const result = await service.generateAssessment('u1', 'Math', 'Algebra', 'medium', 5);

      expect(result.id).toBe('a1');
      expect(result.questionCount).toBe(5);

      const createCall = mockedPrisma.teacherAssessment.create.mock.calls[0][0];
      const content = JSON.parse(createCall.data.content);
      expect(content.questions).toHaveLength(5);
      expect(content.questions[0]).toHaveProperty('question');
      expect(content.questions[0]).toHaveProperty('options');
      expect(content.questions[0]).toHaveProperty('correctAnswer');
      expect(content.questions[0]).toHaveProperty('explanation');

      const answerKey = JSON.parse(createCall.data.answerKey);
      expect(answerKey).toHaveLength(5);
      expect(answerKey[0]).toHaveProperty('questionNumber', 1);
      expect(answerKey[0]).toHaveProperty('correctAnswer');
      expect(answerKey[0]).toHaveProperty('explanation');
    });
  });

  describe('generateHomework', () => {
    it('creates homework record', async () => {
      const hw = {
        id: 'h1', userId: 'u1', subject: 'Science', topic: 'Cells', grade: '8th',
        title: 'Cell Worksheet', description: 'Complete worksheet', dueDays: 7, createdAt: new Date(),
      };
      mockedPrisma.teacherHomework.create.mockResolvedValue(hw as never);

      const result = await service.generateHomework('u1', 'Science', 'Cells', '8th', 'Cell Worksheet', 'Complete worksheet', 7);

      expect(result.id).toBe('h1');
      expect(result.title).toBe('Cell Worksheet');
      expect(result.dueDays).toBe(7);
      expect(mockedPrisma.teacherHomework.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          subject: 'Science',
          topic: 'Cells',
          grade: '8th',
          title: 'Cell Worksheet',
          description: 'Complete worksheet',
          dueDays: 7,
        },
      });
    });
  });

  describe('generateRubric', () => {
    it('creates rubric record', async () => {
      const rubric = {
        id: 'r1', userId: 'u1', title: 'Essay Rubric', subject: 'English',
        assessmentType: 'essay', criteria: 'Grammar, Content, Structure', totalPoints: 100, createdAt: new Date(),
      };
      mockedPrisma.teacherRubric.create.mockResolvedValue(rubric as never);

      const result = await service.generateRubric('u1', 'Essay Rubric', 'English', 'essay', 'Grammar, Content, Structure', 100);

      expect(result.id).toBe('r1');
      expect(result.totalPoints).toBe(100);
      expect(mockedPrisma.teacherRubric.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          title: 'Essay Rubric',
          subject: 'English',
          assessmentType: 'essay',
          criteria: 'Grammar, Content, Structure',
          totalPoints: 100,
        },
      });
    });
  });

  describe('getLessonPlans', () => {
    it('returns paginated lesson plans', async () => {
      const plans = [
        { id: 'lp1', userId: 'u1', subject: 'Math', topic: 'Algebra', grade: '10th', durationMin: 60, content: '{}', createdAt: new Date(), updatedAt: new Date() },
      ];
      mockedPrisma.teacherLessonPlan.findMany.mockResolvedValue(plans as never);
      mockedPrisma.teacherLessonPlan.count.mockResolvedValue(1);

      const result = await service.getLessonPlans('u1', undefined, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('filters by subject when provided', async () => {
      mockedPrisma.teacherLessonPlan.findMany.mockResolvedValue([]);
      mockedPrisma.teacherLessonPlan.count.mockResolvedValue(0);

      await service.getLessonPlans('u1', 'Science');

      const findManyCall = mockedPrisma.teacherLessonPlan.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual({ userId: 'u1', subject: 'Science' });
    });
  });

  describe('getAssessments', () => {
    it('returns paginated assessments', async () => {
      const assessments = [
        { id: 'a1', userId: 'u1', subject: 'Math', topic: 'Algebra', difficulty: 'easy', questionCount: 10, content: '{}', createdAt: new Date() },
      ];
      mockedPrisma.teacherAssessment.findMany.mockResolvedValue(assessments as never);
      mockedPrisma.teacherAssessment.count.mockResolvedValue(1);

      const result = await service.getAssessments('u1');

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('deleteLessonPlan', () => {
    it('deletes plan with ownership check', async () => {
      mockedPrisma.teacherLessonPlan.findUnique.mockResolvedValue({ id: 'lp1', userId: 'u1' } as never);
      mockedPrisma.teacherLessonPlan.delete.mockResolvedValue({} as never);

      const result = await service.deleteLessonPlan('lp1', 'u1');

      expect(result).toBe(true);
      expect(mockedPrisma.teacherLessonPlan.delete).toHaveBeenCalledWith({ where: { id: 'lp1' } });
    });

    it('returns false when plan not found', async () => {
      mockedPrisma.teacherLessonPlan.findUnique.mockResolvedValue(null);

      const result = await service.deleteLessonPlan('lp1', 'u1');

      expect(result).toBe(false);
      expect(mockedPrisma.teacherLessonPlan.delete).not.toHaveBeenCalled();
    });

    it('returns false when userId does not match', async () => {
      mockedPrisma.teacherLessonPlan.findUnique.mockResolvedValue({ id: 'lp1', userId: 'other-user' } as never);

      const result = await service.deleteLessonPlan('lp1', 'u1');

      expect(result).toBe(false);
      expect(mockedPrisma.teacherLessonPlan.delete).not.toHaveBeenCalled();
    });
  });

  describe('deleteAssessment', () => {
    it('deletes assessment with ownership check', async () => {
      mockedPrisma.teacherAssessment.findUnique.mockResolvedValue({ id: 'a1', userId: 'u1' } as never);
      mockedPrisma.teacherAssessment.delete.mockResolvedValue({} as never);

      const result = await service.deleteAssessment('a1', 'u1');

      expect(result).toBe(true);
      expect(mockedPrisma.teacherAssessment.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
    });

    it('returns false when userId does not match', async () => {
      mockedPrisma.teacherAssessment.findUnique.mockResolvedValue({ id: 'a1', userId: 'other' } as never);

      const result = await service.deleteAssessment('a1', 'u1');

      expect(result).toBe(false);
    });
  });
});
