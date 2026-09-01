import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniversityService } from '@/services/education/university.service';

vi.mock('@/lib/prisma', () => {
  const mock = {
    university: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    universityRanking: {
      findMany: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
const mockedPrisma = vi.mocked(prisma);

describe('UniversityService', () => {
  let service: UniversityService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UniversityService();
  });

  describe('searchUniversities', () => {
    it('returns paginated results with course count', async () => {
      const universities = [
        { id: 'uni-001', name: 'LUMS', country: 'Pakistan', _count: { courses: 3 } },
      ];
      mockedPrisma.university.findMany.mockResolvedValue(universities as never);
      mockedPrisma.university.count.mockResolvedValue(1);

      const result = await service.searchUniversities({});

      expect(result.data).toEqual(universities);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockedPrisma.university.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('filters by country', async () => {
      mockedPrisma.university.findMany.mockResolvedValue([]);
      mockedPrisma.university.count.mockResolvedValue(0);

      await service.searchUniversities({ country: 'Pakistan' });

      const where = mockedPrisma.university.findMany.mock.calls[0][0].where;
      expect(where.country).toEqual({ contains: 'Pakistan' });
    });

    it('filters by type', async () => {
      mockedPrisma.university.findMany.mockResolvedValue([]);
      mockedPrisma.university.count.mockResolvedValue(0);

      await service.searchUniversities({ type: 'public' });

      const where = mockedPrisma.university.findMany.mock.calls[0][0].where;
      expect(where.type).toEqual({ equals: 'public' });
    });

    it('handles pagination parameters', async () => {
      mockedPrisma.university.findMany.mockResolvedValue([]);
      mockedPrisma.university.count.mockResolvedValue(0);

      const result = await service.searchUniversities({ page: 3, limit: 5 });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(5);
      expect(mockedPrisma.university.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });

    it('filters by field via courses', async () => {
      mockedPrisma.university.findMany.mockResolvedValue([]);
      mockedPrisma.university.count.mockResolvedValue(0);

      await service.searchUniversities({ field: 'Computer Science' });

      const where = mockedPrisma.university.findMany.mock.calls[0][0].where;
      expect(where.courses).toEqual({
        some: {
          OR: [
            { name: { contains: 'Computer Science' } },
            { degree: { contains: 'Computer Science' } },
            { description: { contains: 'Computer Science' } },
          ],
        },
      });
    });

    it('filters by city', async () => {
      mockedPrisma.university.findMany.mockResolvedValue([]);
      mockedPrisma.university.count.mockResolvedValue(0);

      await service.searchUniversities({ city: 'Lahore' });

      const where = mockedPrisma.university.findMany.mock.calls[0][0].where;
      expect(where.city).toEqual({ contains: 'Lahore' });
    });

    it('filters by keyword across name and description', async () => {
      mockedPrisma.university.findMany.mockResolvedValue([]);
      mockedPrisma.university.count.mockResolvedValue(0);

      await service.searchUniversities({ keyword: 'engineering' });

      const where = mockedPrisma.university.findMany.mock.calls[0][0].where;
      expect(where.OR).toEqual([
        { name: { contains: 'engineering' } },
        { description: { contains: 'engineering' } },
      ]);
    });
  });

  describe('getUniversityById', () => {
    it('returns university with courses and rankings', async () => {
      const university = {
        id: 'uni-001',
        name: 'LUMS',
        courses: [{ id: 'course-001', name: 'BS CS' }],
        rankings: [{ id: 'ranking-001', provider: 'QS', year: 2024 }],
        admissionRequirements: [],
      };
      mockedPrisma.university.findUnique.mockResolvedValue(university as never);

      const result = await service.getUniversityById('uni-001');

      expect(result).toEqual(university);
      expect(mockedPrisma.university.findUnique).toHaveBeenCalledWith({
        where: { id: 'uni-001' },
        include: {
          courses: { orderBy: { name: 'asc' } },
          rankings: { orderBy: { position: 'asc' } },
          admissionRequirements: true,
          campuses: { orderBy: [{ isMain: 'desc' }, { name: 'asc' }] },
          departments: { orderBy: { name: 'asc' } },
        },
      });
    });

    it('returns null for missing university', async () => {
      mockedPrisma.university.findUnique.mockResolvedValue(null);

      const result = await service.getUniversityById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getUniversityRankings', () => {
    it('returns rankings for a university', async () => {
      const rankings = [
        { id: 'ranking-001', universityId: 'uni-001', provider: 'QS', year: 2024, position: 1 },
      ];
      mockedPrisma.universityRanking.findMany.mockResolvedValue(rankings as never);

      const result = await service.getUniversityRankings('uni-001');

      expect(result).toEqual(rankings);
      expect(mockedPrisma.universityRanking.findMany).toHaveBeenCalledWith({
        where: { universityId: 'uni-001' },
        orderBy: { year: 'desc' },
      });
    });
  });

  describe('getCountries', () => {
    it('returns country list', async () => {
      const universities = [
        { country: 'Pakistan' },
        { country: 'Germany' },
        { country: 'United States' },
      ];
      mockedPrisma.university.findMany.mockResolvedValue(universities as never);

      const result = await service.getCountries();

      expect(result).toEqual(['Pakistan', 'Germany', 'United States']);
      expect(mockedPrisma.university.findMany).toHaveBeenCalledWith({
        select: { country: true },
        distinct: ['country'],
        orderBy: { country: 'asc' },
      });
    });
  });

  describe('getCities', () => {
    it('returns city list for a country', async () => {
      const results = [
        { city: 'Islamabad' },
        { city: 'Karachi' },
        { city: 'Lahore' },
      ];
      mockedPrisma.university.findMany.mockResolvedValue(results as never);

      const result = await service.getCities({ country: 'Pakistan' });

      expect(result).toEqual(['Islamabad', 'Karachi', 'Lahore']);
      expect(mockedPrisma.university.findMany).toHaveBeenCalledWith({
        where: { country: { contains: 'Pakistan' }, city: { not: null } },
        select: { city: true },
        distinct: ['city'],
        orderBy: { city: 'asc' },
      });
    });
  });

  describe('compareUniversities', () => {
    it('returns multiple universities (limit 4)', async () => {
      const universities = [
        { id: 'uni-001', name: 'LUMS', courses: [], rankings: [] },
        { id: 'uni-002', name: 'NUST', courses: [], rankings: [] },
      ];
      mockedPrisma.university.findMany.mockResolvedValue(universities as never);

      const result = await service.compareUniversities(['uni-001', 'uni-002']);

      expect(result).toEqual(universities);
      expect(result).toHaveLength(2);
    });

    it('throws when no ids provided', async () => {
      await expect(service.compareUniversities([])).rejects.toThrow(
        'Compare requires 1-4 university IDs',
      );
    });

    it('throws when more than 4 ids provided', async () => {
      await expect(
        service.compareUniversities(['u1', 'u2', 'u3', 'u4', 'u5']),
      ).rejects.toThrow('Compare requires 1-4 university IDs');
    });
  });
});
