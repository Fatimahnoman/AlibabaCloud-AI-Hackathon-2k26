import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavedItemsService } from '@/services/education/saved-items.service';

vi.mock('@/lib/prisma', () => {
  const mock = {
    savedCourse: {
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    savedUniversity: {
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    savedScholarship: {
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
const mockedPrisma = vi.mocked(prisma);

describe('SavedItemsService', () => {
  let service: SavedItemsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SavedItemsService();
  });

  describe('saveCourse', () => {
    it('creates saved course', async () => {
      mockedPrisma.savedCourse.findUnique.mockResolvedValue(null);
      const created = {
        id: 'sc-001',
        userId: 'u1',
        courseId: 'c1',
        notes: 'Great course',
        course: { id: 'c1', name: 'BS CS', university: { id: 'uni-001', name: 'LUMS', country: 'Pakistan', city: 'Lahore', logoUrl: null } },
      };
      mockedPrisma.savedCourse.create.mockResolvedValue(created as never);

      const result = await service.saveCourse('u1', 'c1', 'Great course');

      expect(result).toEqual(created);
      expect(mockedPrisma.savedCourse.create).toHaveBeenCalled();
    });

    it('throws if already saved', async () => {
      mockedPrisma.savedCourse.findUnique.mockResolvedValue({ id: 'existing' } as never);

      await expect(service.saveCourse('u1', 'c1')).rejects.toThrow('Course is already saved');
    });
  });

  describe('unsaveCourse', () => {
    it('removes saved course', async () => {
      mockedPrisma.savedCourse.findUnique.mockResolvedValue({ id: 'sc-001' } as never);
      mockedPrisma.savedCourse.delete.mockResolvedValue({} as never);

      await service.unsaveCourse('u1', 'c1');

      expect(mockedPrisma.savedCourse.delete).toHaveBeenCalled();
    });

    it('throws if not saved', async () => {
      mockedPrisma.savedCourse.findUnique.mockResolvedValue(null);

      await expect(service.unsaveCourse('u1', 'c1')).rejects.toThrow('Course is not saved');
    });
  });

  describe('getSavedCourses', () => {
    it('returns saved courses with course info', async () => {
      const saved = [
        { id: 'sc-001', userId: 'u1', courseId: 'c1', course: { id: 'c1', name: 'BS CS', university: {} } },
      ];
      mockedPrisma.savedCourse.findMany.mockResolvedValue(saved as never);

      const result = await service.getSavedCourses('u1');

      expect(result).toEqual(saved);
      expect(mockedPrisma.savedCourse.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('isCourseSaved', () => {
    it('returns true when saved', async () => {
      mockedPrisma.savedCourse.findUnique.mockResolvedValue({ id: 'sc-001' } as never);

      const result = await service.isCourseSaved('u1', 'c1');

      expect(result).toBe(true);
    });

    it('returns false when not saved', async () => {
      mockedPrisma.savedCourse.findUnique.mockResolvedValue(null);

      const result = await service.isCourseSaved('u1', 'c1');

      expect(result).toBe(false);
    });
  });

  describe('saveUniversity', () => {
    it('creates saved university', async () => {
      mockedPrisma.savedUniversity.findUnique.mockResolvedValue(null);
      const created = {
        id: 'su-001',
        userId: 'u1',
        universityId: 'uni-001',
        university: { id: 'uni-001', name: 'LUMS', _count: { courses: 3 } },
      };
      mockedPrisma.savedUniversity.create.mockResolvedValue(created as never);

      const result = await service.saveUniversity('u1', 'uni-001');

      expect(result).toEqual(created);
    });

    it('throws if already saved', async () => {
      mockedPrisma.savedUniversity.findUnique.mockResolvedValue({ id: 'existing' } as never);

      await expect(service.saveUniversity('u1', 'uni-001')).rejects.toThrow(
        'University is already saved',
      );
    });
  });

  describe('unsaveUniversity', () => {
    it('removes saved university', async () => {
      mockedPrisma.savedUniversity.findUnique.mockResolvedValue({ id: 'su-001' } as never);
      mockedPrisma.savedUniversity.delete.mockResolvedValue({} as never);

      await service.unsaveUniversity('u1', 'uni-001');

      expect(mockedPrisma.savedUniversity.delete).toHaveBeenCalled();
    });

    it('throws if not saved', async () => {
      mockedPrisma.savedUniversity.findUnique.mockResolvedValue(null);

      await expect(service.unsaveUniversity('u1', 'uni-001')).rejects.toThrow(
        'University is not saved',
      );
    });
  });

  describe('getSavedUniversities', () => {
    it('returns saved universities with course info', async () => {
      const saved = [
        { id: 'su-001', userId: 'u1', universityId: 'uni-001', university: { id: 'uni-001', name: 'LUMS', courses: [], rankings: [], _count: { courses: 3 } } },
      ];
      mockedPrisma.savedUniversity.findMany.mockResolvedValue(saved as never);

      const result = await service.getSavedUniversities('u1');

      expect(result).toEqual(saved);
    });
  });

  describe('isUniversitySaved', () => {
    it('returns true when saved', async () => {
      mockedPrisma.savedUniversity.findUnique.mockResolvedValue({ id: 'su-001' } as never);

      const result = await service.isUniversitySaved('u1', 'uni-001');

      expect(result).toBe(true);
    });

    it('returns false when not saved', async () => {
      mockedPrisma.savedUniversity.findUnique.mockResolvedValue(null);

      const result = await service.isUniversitySaved('u1', 'uni-001');

      expect(result).toBe(false);
    });
  });

  describe('saveScholarship', () => {
    it('creates saved scholarship', async () => {
      mockedPrisma.savedScholarship.findUnique.mockResolvedValue(null);
      const created = {
        id: 'ss-001',
        userId: 'u1',
        scholarshipId: 'sch-001',
        scholarship: { id: 'sch-001', name: 'Fulbright', requirements: [] },
      };
      mockedPrisma.savedScholarship.create.mockResolvedValue(created as never);

      const result = await service.saveScholarship('u1', 'sch-001');

      expect(result).toEqual(created);
    });

    it('throws if already saved', async () => {
      mockedPrisma.savedScholarship.findUnique.mockResolvedValue({ id: 'existing' } as never);

      await expect(service.saveScholarship('u1', 'sch-001')).rejects.toThrow(
        'Scholarship is already saved',
      );
    });
  });

  describe('unsaveScholarship', () => {
    it('removes saved scholarship', async () => {
      mockedPrisma.savedScholarship.findUnique.mockResolvedValue({ id: 'ss-001' } as never);
      mockedPrisma.savedScholarship.delete.mockResolvedValue({} as never);

      await service.unsaveScholarship('u1', 'sch-001');

      expect(mockedPrisma.savedScholarship.delete).toHaveBeenCalled();
    });

    it('throws if not saved', async () => {
      mockedPrisma.savedScholarship.findUnique.mockResolvedValue(null);

      await expect(service.unsaveScholarship('u1', 'sch-001')).rejects.toThrow(
        'Scholarship is not saved',
      );
    });
  });

  describe('getSavedScholarships', () => {
    it('returns saved scholarships', async () => {
      const saved = [
        { id: 'ss-001', userId: 'u1', scholarshipId: 'sch-001', scholarship: { id: 'sch-001', name: 'Fulbright', requirements: [] } },
      ];
      mockedPrisma.savedScholarship.findMany.mockResolvedValue(saved as never);

      const result = await service.getSavedScholarships('u1');

      expect(result).toEqual(saved);
    });
  });

  describe('isScholarshipSaved', () => {
    it('returns true when saved', async () => {
      mockedPrisma.savedScholarship.findUnique.mockResolvedValue({ id: 'ss-001' } as never);

      const result = await service.isScholarshipSaved('u1', 'sch-001');

      expect(result).toBe(true);
    });

    it('returns false when not saved', async () => {
      mockedPrisma.savedScholarship.findUnique.mockResolvedValue(null);

      const result = await service.isScholarshipSaved('u1', 'sch-001');

      expect(result).toBe(false);
    });
  });
});
