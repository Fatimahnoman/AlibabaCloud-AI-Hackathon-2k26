import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CourseService } from '@/services/education/course.service';

vi.mock('@/lib/prisma', () => {
  const mock = {
    course: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    careerPath: {
      findMany: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
const mockedPrisma = vi.mocked(prisma);

describe('CourseService', () => {
  let service: CourseService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CourseService();
  });

  describe('searchCourses', () => {
    it('returns paginated results with university info', async () => {
      const courses = [
        {
          id: 'course-001',
          name: 'BS Computer Science',
          degree: 'bachelor',
          university: { id: 'uni-001', name: 'LUMS', country: 'Pakistan', city: 'Lahore', logoUrl: null, type: 'private', ranking: null },
        },
      ];
      mockedPrisma.course.findMany.mockResolvedValue(courses as never);
      mockedPrisma.course.count.mockResolvedValue(1);

      const result = await service.searchCourses({});

      expect(result.data).toEqual(courses);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockedPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('filters by field', async () => {
      mockedPrisma.course.findMany.mockResolvedValue([]);
      mockedPrisma.course.count.mockResolvedValue(0);

      await service.searchCourses({ field: 'Computer Science' });

      const where = mockedPrisma.course.findMany.mock.calls[0][0].where;
      expect(where.OR).toEqual([
        { name: { contains: 'Computer Science' } },
        { description: { contains: 'Computer Science' } },
        { degree: { contains: 'Computer Science' } },
      ]);
    });

    it('filters by level', async () => {
      mockedPrisma.course.findMany.mockResolvedValue([]);
      mockedPrisma.course.count.mockResolvedValue(0);

      await service.searchCourses({ level: 'bachelor' });

      const where = mockedPrisma.course.findMany.mock.calls[0][0].where;
      expect(where.degree).toEqual({ contains: 'bachelor' });
    });

    it('filters by country via university', async () => {
      mockedPrisma.course.findMany.mockResolvedValue([]);
      mockedPrisma.course.count.mockResolvedValue(0);

      await service.searchCourses({ country: 'Germany' });

      const where = mockedPrisma.course.findMany.mock.calls[0][0].where;
      expect(where.university).toEqual({ country: { contains: 'Germany' } });
    });

    it('handles pagination parameters', async () => {
      mockedPrisma.course.findMany.mockResolvedValue([]);
      mockedPrisma.course.count.mockResolvedValue(0);

      const result = await service.searchCourses({ page: 2, limit: 5 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(mockedPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('combines field and keyword filters with AND', async () => {
      mockedPrisma.course.findMany.mockResolvedValue([]);
      mockedPrisma.course.count.mockResolvedValue(0);

      await service.searchCourses({ field: 'Computer', keyword: 'science' });

      const where = mockedPrisma.course.findMany.mock.calls[0][0].where;
      expect(where.AND).toHaveLength(2);
    });
  });

  describe('getCourseById', () => {
    it('returns course with university and admission requirements', async () => {
      const course = {
        id: 'course-001',
        name: 'BS Computer Science',
        university: { id: 'uni-001', name: 'LUMS' },
        admissionRequirements: [
          { id: 'adm-001', requirementType: 'academic_transcript', country: { id: 'country-001', name: 'Pakistan', code: 'PK' } },
        ],
      };
      mockedPrisma.course.findUnique.mockResolvedValue(course as never);

      const result = await service.getCourseById('course-001');

      expect(result).toEqual(course);
      expect(mockedPrisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: 'course-001' },
        include: {
          university: true,
          admissionRequirements: {
            include: {
              country: { select: { id: true, name: true, code: true } },
            },
          },
        },
      });
    });

    it('throws on missing course', async () => {
      mockedPrisma.course.findUnique.mockResolvedValue(null);

      await expect(service.getCourseById('nonexistent')).rejects.toThrow(
        'Course with id "nonexistent" not found',
      );
    });
  });

  describe('getCourseFields', () => {
    it('returns distinct fields', async () => {
      const careerPaths = [
        { field: 'Computer Science' },
        { field: 'Business' },
        { field: 'Medicine' },
      ];
      mockedPrisma.careerPath.findMany.mockResolvedValue(careerPaths as never);

      const result = await service.getCourseFields();

      expect(result).toEqual(['Computer Science', 'Business', 'Medicine']);
      expect(mockedPrisma.careerPath.findMany).toHaveBeenCalledWith({
        select: { field: true },
        distinct: ['field'],
        orderBy: { field: 'asc' },
      });
    });
  });

  describe('getCourseLevels', () => {
    it('returns level list', async () => {
      const result = await service.getCourseLevels();

      expect(result).toEqual([
        'certificate', 'diploma', 'associate', 'bachelor', 'master', 'mphil', 'phd',
      ]);
    });
  });

  describe('getCareerPathsByCourse', () => {
    it('returns career paths for course field', async () => {
      mockedPrisma.course.findUnique.mockResolvedValue({
        id: 'course-001',
        name: 'BS Computer Science',
        degree: 'bachelor',
        description: 'A CS program',
      } as never);
      const paths = [{ id: 'career-001', title: 'Software Engineer', field: 'Computer Science' }];
      mockedPrisma.careerPath.findMany.mockResolvedValue(paths as never);

      const result = await service.getCareerPathsByCourse('course-001');

      expect(result).toEqual(paths);
      expect(mockedPrisma.careerPath.findMany).toHaveBeenCalled();
    });

    it('throws on missing course', async () => {
      mockedPrisma.course.findUnique.mockResolvedValue(null);

      await expect(service.getCareerPathsByCourse('nonexistent')).rejects.toThrow(
        'Course with id "nonexistent" not found',
      );
    });
  });
});
