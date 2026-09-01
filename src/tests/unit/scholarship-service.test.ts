import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScholarshipService } from '@/services/education/scholarship.service';

vi.mock('@/lib/prisma', () => {
  const mock = {
    scholarship: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    scholarshipRequirement: {
      findMany: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
const mockedPrisma = vi.mocked(prisma);

describe('ScholarshipService', () => {
  let service: ScholarshipService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ScholarshipService();
  });

  describe('searchScholarships', () => {
    it('returns paginated results', async () => {
      const scholarships = [
        { id: 'scholarship-001', name: 'Fulbright', requirements: [] },
      ];
      mockedPrisma.scholarship.findMany.mockResolvedValue(scholarships as never);
      mockedPrisma.scholarship.count.mockResolvedValue(1);

      const result = await service.searchScholarships({});

      expect(result.data).toEqual(scholarships);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockedPrisma.scholarship.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('filters by country', async () => {
      mockedPrisma.scholarship.findMany.mockResolvedValue([]);
      mockedPrisma.scholarship.count.mockResolvedValue(0);

      await service.searchScholarships({ country: 'Germany' });

      const where = mockedPrisma.scholarship.findMany.mock.calls[0][0].where;
      expect(where.country).toEqual({ contains: 'Germany' });
    });

    it('filters by degreeLevel', async () => {
      mockedPrisma.scholarship.findMany.mockResolvedValue([]);
      mockedPrisma.scholarship.count.mockResolvedValue(0);

      await service.searchScholarships({ degreeLevel: 'master' });

      const where = mockedPrisma.scholarship.findMany.mock.calls[0][0].where;
      expect(where.requirements).toEqual({
        some: {
          OR: [
            { requirementType: 'degree_level', requirementValue: { contains: 'master' } },
            { requirementType: 'program_type', requirementValue: { contains: 'master' } },
          ],
        },
      });
    });

    it('handles pagination parameters', async () => {
      mockedPrisma.scholarship.findMany.mockResolvedValue([]);
      mockedPrisma.scholarship.count.mockResolvedValue(0);

      const result = await service.searchScholarships({ page: 2, limit: 5 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(mockedPrisma.scholarship.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('filters by keyword with OR', async () => {
      mockedPrisma.scholarship.findMany.mockResolvedValue([]);
      mockedPrisma.scholarship.count.mockResolvedValue(0);

      await service.searchScholarships({ keyword: 'fulbright' });

      const where = mockedPrisma.scholarship.findMany.mock.calls[0][0].where;
      expect(where.OR).toEqual([
        { name: { contains: 'fulbright' } },
        { description: { contains: 'fulbright' } },
        { provider: { contains: 'fulbright' } },
      ]);
    });
  });

  describe('getScholarshipById', () => {
    it('returns scholarship with requirements', async () => {
      const scholarship = {
        id: 'scholarship-001',
        name: 'Fulbright',
        requirements: [
          { id: 'sr-001', requirementType: 'nationality', requirementValue: 'Pakistani' },
        ],
      };
      mockedPrisma.scholarship.findUnique.mockResolvedValue(scholarship as never);

      const result = await service.getScholarshipById('scholarship-001');

      expect(result).toEqual(scholarship);
      expect(mockedPrisma.scholarship.findUnique).toHaveBeenCalledWith({
        where: { id: 'scholarship-001' },
        include: { requirements: true },
      });
    });

    it('throws on missing scholarship', async () => {
      mockedPrisma.scholarship.findUnique.mockResolvedValue(null);

      await expect(service.getScholarshipById('nonexistent')).rejects.toThrow(
        'Scholarship with id "nonexistent" not found',
      );
    });
  });

  describe('getUpcomingDeadlines', () => {
    it('returns scholarships with future deadlines', async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const scholarships = [
        { id: 'scholarship-001', name: 'Fulbright', deadline: futureDate, requirements: [] },
      ];
      mockedPrisma.scholarship.findMany.mockResolvedValue(scholarships as never);

      const result = await service.getUpcomingDeadlines(5);

      expect(result).toEqual(scholarships);
      expect(mockedPrisma.scholarship.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deadline: {
              not: null,
              gte: expect.any(Date),
            },
          },
          take: 5,
        }),
      );
    });

    it('defaults limit to 10', async () => {
      mockedPrisma.scholarship.findMany.mockResolvedValue([]);

      await service.getUpcomingDeadlines();

      expect(mockedPrisma.scholarship.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });
});
