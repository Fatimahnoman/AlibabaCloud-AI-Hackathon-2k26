import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CareerGuidanceService } from '@/services/education/career.service';

vi.mock('@/lib/prisma', () => {
  const mock = {
    careerPath: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
const mockedPrisma = vi.mocked(prisma);

const mockCareerPath = {
  id: 'career-001',
  title: 'Software Engineer',
  slug: 'software-engineer',
  field: 'Computer Science',
  description: 'Build software',
  skills: '["JavaScript","Python"]',
  entryRoles: '["Junior Dev"]',
  certifications: null,
  furtherStudy: null,
  sourceUrl: null,
  verificationStatus: 'pending',
  lastVerifiedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CareerGuidanceService', () => {
  let service: CareerGuidanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CareerGuidanceService();
  });

  describe('getCareerPaths', () => {
    it('returns paginated results', async () => {
      mockedPrisma.careerPath.findMany.mockResolvedValue([mockCareerPath] as never);
      mockedPrisma.careerPath.count.mockResolvedValue(1);

      const result = await service.getCareerPaths({});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].skills).toEqual(['JavaScript', 'Python']);
      expect(result.data[0].entryRoles).toEqual(['Junior Dev']);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockedPrisma.careerPath.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('filters by field using OR mapping', async () => {
      mockedPrisma.careerPath.findMany.mockResolvedValue([]);
      mockedPrisma.careerPath.count.mockResolvedValue(0);

      await service.getCareerPaths({ field: 'Technology' });

      const where = mockedPrisma.careerPath.findMany.mock.calls[0][0].where;
      expect(where.OR).toBeDefined();
      expect(where.OR.length).toBeGreaterThan(0);
    });

    it('handles pagination parameters', async () => {
      mockedPrisma.careerPath.findMany.mockResolvedValue([]);
      mockedPrisma.careerPath.count.mockResolvedValue(0);

      const result = await service.getCareerPaths({ page: 2, limit: 5 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(mockedPrisma.careerPath.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('filters by keyword with OR', async () => {
      mockedPrisma.careerPath.findMany.mockResolvedValue([]);
      mockedPrisma.careerPath.count.mockResolvedValue(0);

      await service.getCareerPaths({ keyword: 'engineer' });

      const where = mockedPrisma.careerPath.findMany.mock.calls[0][0].where;
      expect(where.OR).toBeDefined();
      expect(where.OR).toEqual(
        expect.arrayContaining([
          { title: { contains: 'engineer' } },
          { description: { contains: 'engineer' } },
          { field: { contains: 'engineer' } },
          { skills: { contains: 'engineer' } },
        ]),
      );
    });
  });

  describe('getCareerPathBySlug', () => {
    it('returns career path with parsed fields', async () => {
      mockedPrisma.careerPath.findUnique.mockResolvedValue(mockCareerPath as never);

      const result = await service.getCareerPathBySlug('software-engineer');

      expect(result.skills).toEqual(['JavaScript', 'Python']);
      expect(result.entryRoles).toEqual(['Junior Dev']);
      expect(mockedPrisma.careerPath.findUnique).toHaveBeenCalledWith({
        where: { slug: 'software-engineer' },
      });
    });

    it('throws on missing career path', async () => {
      mockedPrisma.careerPath.findUnique.mockResolvedValue(null);

      await expect(service.getCareerPathBySlug('nonexistent')).rejects.toThrow(
        'Career path with slug "nonexistent" not found',
      );
    });
  });

  describe('getCareerPathsByField', () => {
    it('returns paths for a field with OR mapping', async () => {
      const paths = [mockCareerPath];
      mockedPrisma.careerPath.findMany.mockResolvedValue(paths as never);

      const result = await service.getCareerPathsByField('Computer Science');

      expect(result).toHaveLength(1);
      expect(result[0].skills).toEqual(['JavaScript', 'Python']);
      expect(mockedPrisma.careerPath.findMany).toHaveBeenCalledWith({
        where: { OR: [{ field: { contains: 'Computer Science' } }] },
        orderBy: { title: 'asc' },
      });
    });
  });

  describe('getCareersAfterDegree', () => {
    it('finds matching paths', async () => {
      mockedPrisma.careerPath.findMany.mockResolvedValueOnce([mockCareerPath] as never);

      const result = await service.getCareersAfterDegree('Computer Science');

      expect(result).toHaveLength(1);
      expect(mockedPrisma.careerPath.findMany).toHaveBeenCalled();
    });

    it('falls back to field search when no direct matches', async () => {
      mockedPrisma.careerPath.findMany.mockResolvedValueOnce([] as never);
      mockedPrisma.careerPath.findMany.mockResolvedValueOnce([mockCareerPath] as never);

      const result = await service.getCareersAfterDegree('Computer Science', 'Technology');

      expect(result).toHaveLength(1);
      expect(mockedPrisma.careerPath.findMany).toHaveBeenCalledTimes(2);
    });

    it('returns empty when no matches and no field', async () => {
      mockedPrisma.careerPath.findMany.mockResolvedValue([] as never);

      const result = await service.getCareersAfterDegree('XYZ');

      expect(result).toEqual([]);
    });
  });
});
