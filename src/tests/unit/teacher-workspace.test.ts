import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  classroom: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  classroomEnrollment: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  classroomResource: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), delete: vi.fn() },
  studyTopic: { findMany: vi.fn() },
  practiceQuiz: { findMany: vi.fn() },
  studySession: { findMany: vi.fn() },
  user: { findUnique: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({ default: mockPrisma }));

import { TeacherWorkspaceService } from '@/services/teacher/teacher-workspace.service';

const mockedPrisma = vi.mocked(mockPrisma);

const mockClassroom = (overrides: Record<string, unknown> = {}) => ({
  id: 'class-1',
  teacherId: 'teacher-1',
  name: 'Algebra I',
  subject: 'Mathematics',
  grade: '9',
  description: 'Intro algebra',
  inviteCode: 'ABCD2345',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

const mockEnrollment = (overrides: Record<string, unknown> = {}) => ({
  id: 'enr-1',
  classroomId: 'class-1',
  studentId: 'student-1',
  status: 'active',
  joinedAt: new Date('2026-01-02'),
  updatedAt: new Date('2026-01-02'),
  ...overrides,
});

const mockResource = (overrides: Record<string, unknown> = {}) => ({
  id: 'res-1',
  classroomId: 'class-1',
  title: 'Chapter 1 Notes',
  description: 'PDF notes',
  resourceType: 'document',
  url: 'https://example.com/ch1.pdf',
  contentJson: null,
  uploadedBy: 'teacher-1',
  createdAt: new Date('2026-01-03'),
  ...overrides,
});

describe('TeacherWorkspaceService', () => {
  let service: TeacherWorkspaceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TeacherWorkspaceService();
  });

  describe('createClassroom', () => {
    it('creates classroom with generated invite code', async () => {
      mockedPrisma.classroom.findUnique.mockResolvedValue(null);
      const raw = mockClassroom({ grade: null, description: null, enrollments: [], resources: [] });
      mockedPrisma.classroom.create.mockResolvedValue(raw as never);

      const result = await service.createClassroom('teacher-1', {
        name: 'Algebra I',
        subject: 'Mathematics',
      });

      expect(result.inviteCode).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
      expect(result.name).toBe('Algebra I');
      expect(result.subject).toBe('Mathematics');
      expect(result.grade).toBeUndefined();
      expect(result.enrolledStudents).toBe(0);
      expect(mockedPrisma.classroom.findUnique).toHaveBeenCalledWith({
        where: { inviteCode: expect.any(String) },
      });
      expect(mockedPrisma.classroom.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          teacherId: 'teacher-1',
          name: 'Algebra I',
          subject: 'Mathematics',
          grade: null,
          description: null,
          inviteCode: expect.stringMatching(/^[A-HJ-NP-Z2-9]{8}$/),
        }),
        include: {
          enrollments: { where: { status: 'active' } },
          resources: true,
        },
      });
    });

    it('returns classroom with stats', async () => {
      mockedPrisma.classroom.findUnique.mockResolvedValue(null);
      const raw = mockClassroom({
        enrollments: [
          mockEnrollment({ student: { id: 'student-1', name: 'Ali Khan', email: 'ali@example.com' } }),
          mockEnrollment({ id: 'enr-2', studentId: 'student-2', student: { id: 'student-2', name: 'Sara Ahmed', email: 'sara@example.com' } }),
        ],
        resources: [mockResource()],
      });
      mockedPrisma.classroom.create.mockResolvedValue(raw as never);

      const result = await service.createClassroom('teacher-1', {
        name: 'Algebra I',
        subject: 'Mathematics',
        grade: '9',
        description: 'Intro algebra',
      });

      expect(result.grade).toBe('9');
      expect(result.description).toBe('Intro algebra');
      expect(result.enrolledStudents).toBe(2);
      expect(result.resourceCount).toBe(1);
      expect(result.enrollments[0].studentName).toBe('Ali Khan');
      expect(result.enrollments[0].studentEmail).toBe('ali@example.com');
      expect(result.resources[0].title).toBe('Chapter 1 Notes');
    });
  });

  describe('getClassrooms', () => {
    it('returns classrooms for teacher with counts', async () => {
      const classrooms = [
        { ...mockClassroom(), _count: { enrollments: 5, resources: 3 } },
        { ...mockClassroom({ id: 'class-2', name: 'Geometry' }), _count: { enrollments: 2, resources: 0 } },
      ];
      mockedPrisma.classroom.findMany.mockResolvedValue(classrooms as never);

      const result = await service.getClassrooms('teacher-1');

      expect(result).toHaveLength(2);
      expect(result[0].enrolledStudents).toBe(5);
      expect(result[0].resourceCount).toBe(3);
      expect(result[1].name).toBe('Geometry');
      expect(result[1].enrolledStudents).toBe(2);
      expect(result[1].resourceCount).toBe(0);
      expect(mockedPrisma.classroom.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teacherId: 'teacher-1', isActive: true },
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('filters by isActive', async () => {
      mockedPrisma.classroom.findMany.mockResolvedValue([]);

      await service.getClassrooms('teacher-1');

      expect(mockedPrisma.classroom.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teacherId: 'teacher-1', isActive: true },
        })
      );
    });
  });

  describe('getClassroomById', () => {
    it('returns classroom with enrollments and resources', async () => {
      const raw = mockClassroom({
        enrollments: [
          mockEnrollment({ student: { id: 'student-1', name: 'Ali Khan', email: 'ali@example.com' } }),
        ],
        resources: [
          mockResource({ id: 'res-2', title: 'Worksheet', createdAt: new Date('2026-01-04') }),
          mockResource(),
        ],
      });
      mockedPrisma.classroom.findFirst.mockResolvedValue(raw as never);

      const result = await service.getClassroomById('class-1', 'teacher-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('class-1');
      expect(result!.enrollments).toHaveLength(1);
      expect(result!.enrollments[0].studentName).toBe('Ali Khan');
      expect(result!.resources).toHaveLength(2);
      expect(result!.resources[0].id).toBe('res-2');
      expect(mockedPrisma.classroom.findFirst).toHaveBeenCalledWith({
        where: { id: 'class-1', teacherId: 'teacher-1' },
        include: {
          enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
          resources: { orderBy: { createdAt: 'desc' } },
        },
      });
    });

    it('returns null for wrong teacher', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(null);

      const result = await service.getClassroomById('class-1', 'wrong-teacher');

      expect(result).toBeNull();
      expect(mockedPrisma.classroom.findFirst).toHaveBeenCalledWith({
        where: { id: 'class-1', teacherId: 'wrong-teacher' },
        include: {
          enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
          resources: { orderBy: { createdAt: 'desc' } },
        },
      });
    });
  });

  describe('updateClassroom', () => {
    it('updates classroom fields', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroom.update.mockResolvedValue(
        mockClassroom({ name: 'Algebra II', description: 'Updated', isActive: false }) as never
      );

      const result = await service.updateClassroom('class-1', 'teacher-1', {
        name: 'Algebra II',
        description: 'Updated',
        isActive: false,
      });

      expect(result.name).toBe('Algebra II');
      expect(result.description).toBe('Updated');
      expect(result.isActive).toBe(false);
      expect(mockedPrisma.classroom.update).toHaveBeenCalledWith({
        where: { id: 'class-1' },
        data: { name: 'Algebra II', description: 'Updated', isActive: false },
      });
    });

    it('throws when not found', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(null);

      await expect(
        service.updateClassroom('class-999', 'teacher-1', { name: 'Nope' })
      ).rejects.toThrow('Classroom not found');
      expect(mockedPrisma.classroom.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteClassroom', () => {
    it('deletes and returns true', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroom.delete.mockResolvedValue(mockClassroom() as never);

      const result = await service.deleteClassroom('class-1', 'teacher-1');

      expect(result).toBe(true);
      expect(mockedPrisma.classroom.delete).toHaveBeenCalledWith({ where: { id: 'class-1' } });
    });

    it('returns false when not found', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(null);

      const result = await service.deleteClassroom('class-999', 'teacher-1');

      expect(result).toBe(false);
      expect(mockedPrisma.classroom.delete).not.toHaveBeenCalled();
    });
  });

  describe('joinClassroom', () => {
    it('enrolls student with valid code', async () => {
      mockedPrisma.classroom.findUnique.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroomEnrollment.findFirst.mockResolvedValue(null);
      mockedPrisma.classroomEnrollment.create.mockResolvedValue(mockEnrollment() as never);

      const result = await service.joinClassroom('student-1', 'ABCD2345');

      expect(result.classroomId).toBe('class-1');
      expect(result.studentId).toBe('student-1');
      expect(result.status).toBe('active');
      expect(mockedPrisma.classroom.findUnique).toHaveBeenCalledWith({ where: { inviteCode: 'ABCD2345' } });
      expect(mockedPrisma.classroomEnrollment.create).toHaveBeenCalledWith({
        data: { classroomId: 'class-1', studentId: 'student-1' },
      });
    });

    it('throws for invalid code', async () => {
      mockedPrisma.classroom.findUnique.mockResolvedValue(null);

      await expect(service.joinClassroom('student-1', 'BADCODE1')).rejects.toThrow(
        'Invalid or inactive classroom code'
      );
      expect(mockedPrisma.classroomEnrollment.create).not.toHaveBeenCalled();
    });

    it('throws when already enrolled', async () => {
      mockedPrisma.classroom.findUnique.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroomEnrollment.findFirst.mockResolvedValue(
        mockEnrollment({ status: 'active' }) as never
      );

      await expect(service.joinClassroom('student-1', 'ABCD2345')).rejects.toThrow(
        'Already enrolled in this classroom'
      );
      expect(mockedPrisma.classroomEnrollment.create).not.toHaveBeenCalled();
      expect(mockedPrisma.classroomEnrollment.update).not.toHaveBeenCalled();
    });

    it('reactivates inactive enrollment instead of creating a new one', async () => {
      mockedPrisma.classroom.findUnique.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroomEnrollment.findFirst.mockResolvedValue(
        mockEnrollment({ status: 'inactive' }) as never
      );
      mockedPrisma.classroomEnrollment.update.mockResolvedValue(
        mockEnrollment({ status: 'active' }) as never
      );

      const result = await service.joinClassroom('student-1', 'ABCD2345');

      expect(result.status).toBe('active');
      expect(mockedPrisma.classroomEnrollment.update).toHaveBeenCalledWith({
        where: { id: 'enr-1' },
        data: { status: 'active' },
      });
      expect(mockedPrisma.classroomEnrollment.create).not.toHaveBeenCalled();
    });
  });

  describe('removeStudent', () => {
    it('sets enrollment inactive', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroomEnrollment.findFirst.mockResolvedValue(mockEnrollment() as never);
      mockedPrisma.classroomEnrollment.update.mockResolvedValue(
        mockEnrollment({ status: 'inactive' }) as never
      );

      const result = await service.removeStudent('class-1', 'student-1', 'teacher-1');

      expect(result).toBe(true);
      expect(mockedPrisma.classroomEnrollment.update).toHaveBeenCalledWith({
        where: { id: 'enr-1' },
        data: { status: 'inactive' },
      });
    });

    it('returns false when not found', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroomEnrollment.findFirst.mockResolvedValue(null);

      const result = await service.removeStudent('class-1', 'student-404', 'teacher-1');

      expect(result).toBe(false);
      expect(mockedPrisma.classroomEnrollment.update).not.toHaveBeenCalled();
    });
  });

  describe('getEnrolledStudents', () => {
    it('returns enrolled students with names', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroomEnrollment.findMany.mockResolvedValue([
        mockEnrollment({ student: { id: 'student-1', name: 'Ali Khan', email: 'ali@example.com' } }),
        mockEnrollment({
          id: 'enr-2',
          studentId: 'student-2',
          student: { id: 'student-2', name: 'Sara Ahmed', email: 'sara@example.com' },
        }),
      ] as never);

      const result = await service.getEnrolledStudents('class-1', 'teacher-1');

      expect(result).toHaveLength(2);
      expect(result[0].studentName).toBe('Ali Khan');
      expect(result[0].studentEmail).toBe('ali@example.com');
      expect(result[1].studentName).toBe('Sara Ahmed');
      expect(result[1].status).toBe('active');
      expect(mockedPrisma.classroomEnrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { classroomId: 'class-1', status: 'active' },
          orderBy: { joinedAt: 'asc' },
        })
      );
    });

    it('returns empty when classroom not found', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(null);

      const result = await service.getEnrolledStudents('class-999', 'teacher-1');

      expect(result).toEqual([]);
      expect(mockedPrisma.classroomEnrollment.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getStudentData', () => {
    const setupAccess = () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroomEnrollment.findFirst.mockResolvedValue(mockEnrollment() as never);
      mockedPrisma.user.findUnique.mockResolvedValue({
        id: 'student-1',
        name: 'Ali Khan',
        email: 'ali@example.com',
      } as never);
      mockedPrisma.studyTopic.findMany.mockResolvedValue([
        { subject: 'Mathematics', topic: 'Linear equations', masteryLevel: 80 },
        { subject: 'Mathematics', topic: 'Quadratics', masteryLevel: 60 },
      ] as never);
      mockedPrisma.practiceQuiz.findMany.mockResolvedValue([
        { subject: 'Mathematics', topic: 'Quadratics', percentage: 70, studiedAt: new Date('2026-02-01') },
      ] as never);
      mockedPrisma.studySession.findMany.mockResolvedValue([
        { durationMin: 30 },
        { durationMin: 45 },
      ] as never);
    };

    it('returns student data after enrollment check', async () => {
      setupAccess();

      const result = await service.getStudentData('student-1', 'class-1', 'teacher-1');

      expect(result).not.toBeNull();
      expect(result!.studentId).toBe('student-1');
      expect(result!.studentName).toBe('Ali Khan');
      expect(result!.overallMastery).toBe(70);
      expect(result!.totalStudyMinutes).toBe(75);
      expect(result!.studyTopics).toHaveLength(2);
      expect(result!.studyTopics[0]).toEqual({
        subject: 'Mathematics',
        topic: 'Linear equations',
        masteryLevel: 80,
      });
      expect(result!.recentQuizzes[0].score).toBe(70);
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        select: { id: true, name: true, email: true },
      });
      expect(mockedPrisma.practiceQuiz.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'student-1' }, take: 10 })
      );
    });

    it('returns null when not enrolled', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroomEnrollment.findFirst.mockResolvedValue(null);

      const result = await service.getStudentData('student-404', 'class-1', 'teacher-1');

      expect(result).toBeNull();
      expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockedPrisma.studyTopic.findMany).not.toHaveBeenCalled();
    });

    it('returns null when classroom not found', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(null);

      const result = await service.getStudentData('student-1', 'class-999', 'teacher-1');

      expect(result).toBeNull();
      expect(mockedPrisma.classroomEnrollment.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('addResource', () => {
    it('creates resource', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroomResource.create.mockResolvedValue(
        mockResource({ contentJson: '{"key":"value"}' }) as never
      );

      const result = await service.addResource('class-1', 'teacher-1', {
        title: 'Chapter 1 Notes',
        description: 'PDF notes',
        resourceType: 'document',
        url: 'https://example.com/ch1.pdf',
        content: { key: 'value' },
      });

      expect(result.title).toBe('Chapter 1 Notes');
      expect(result.resourceType).toBe('document');
      expect(result.content).toEqual({ key: 'value' });
      expect(result.uploadedBy).toBe('teacher-1');
      expect(mockedPrisma.classroomResource.create).toHaveBeenCalledWith({
        data: {
          classroomId: 'class-1',
          title: 'Chapter 1 Notes',
          description: 'PDF notes',
          resourceType: 'document',
          url: 'https://example.com/ch1.pdf',
          contentJson: '{"key":"value"}',
          uploadedBy: 'teacher-1',
        },
      });
    });

    it('throws when classroom not found', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(null);

      await expect(
        service.addResource('class-999', 'teacher-1', { title: 'Notes', resourceType: 'document' })
      ).rejects.toThrow('Classroom not found');
      expect(mockedPrisma.classroomResource.create).not.toHaveBeenCalled();
    });
  });

  describe('getResources', () => {
    it('returns resources for classroom', async () => {
      mockedPrisma.classroom.findFirst.mockResolvedValue(mockClassroom() as never);
      mockedPrisma.classroomResource.findMany.mockResolvedValue([
        mockResource(),
        mockResource({
          id: 'res-2',
          title: 'Video lecture',
          resourceType: 'video',
          url: 'https://example.com/v.mp4',
          contentJson: '{"sections":3}',
          createdAt: new Date('2026-01-05'),
        }),
      ] as never);

      const result = await service.getResources('class-1', 'teacher-1');

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Chapter 1 Notes');
      expect(result[1].resourceType).toBe('video');
      expect(result[1].content).toEqual({ sections: 3 });
      expect(mockedPrisma.classroomResource.findMany).toHaveBeenCalledWith({
        where: { classroomId: 'class-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getWorkspaceDashboard', () => {
    it('returns counts and recent classrooms', async () => {
      mockedPrisma.classroom.findMany.mockResolvedValue([
        { ...mockClassroom(), _count: { enrollments: 5, resources: 3 } },
        { ...mockClassroom({ id: 'class-2', name: 'Geometry' }), _count: { enrollments: 2, resources: 1 } },
      ] as never);
      mockedPrisma.classroomEnrollment.findMany.mockResolvedValue([
        mockEnrollment(),
        mockEnrollment({ id: 'enr-2' }),
      ] as never);
      mockedPrisma.classroomResource.findMany.mockResolvedValue([mockResource()] as never);
      mockedPrisma.classroom.count.mockResolvedValue(7);

      const result = await service.getWorkspaceDashboard('teacher-1');

      expect(result.totalClassrooms).toBe(7);
      expect(result.activeClassrooms).toBe(7);
      expect(result.totalStudents).toBe(2);
      expect(result.totalResources).toBe(1);
      expect(result.recentClassrooms).toHaveLength(2);
      expect(result.recentClassrooms[0].name).toBe('Algebra I');
      expect(result.recentClassrooms[0].enrolledStudents).toBe(5);
      expect(result.recentClassrooms[0].resourceCount).toBe(3);
      expect(mockedPrisma.classroom.count).toHaveBeenCalledWith({
        where: { teacherId: 'teacher-1', isActive: true },
      });
      expect(mockedPrisma.classroom.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teacherId: 'teacher-1', isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        })
      );
    });
  });
});
