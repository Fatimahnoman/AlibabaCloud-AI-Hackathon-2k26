import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface SearchSchemesFilters {
  category?: string;
  province?: string;
  keyword?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class SchemeService {
  async searchSchemes(filters: SearchSchemesFilters) {
    const { category, province, keyword, status = 'active', page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.GovernmentSchemeWhereInput = { verificationStatus: 'verified' };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (province) {
      where.OR = [
        { province: 'all' },
        { province },
      ];
    }

    if (keyword) {
      where.AND = where.AND || [];
      (where.AND as Prisma.GovernmentSchemeWhereInput[]).push({
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
          { provider: { contains: keyword } },
          { eligibilityCriteria: { contains: keyword } },
        ],
      });
    }

    const [data, total] = await Promise.all([
      prisma.governmentScheme.findMany({
        where,
        include: {
          requirements: true,
          documents: true,
        },
        skip,
        take: limit,
        orderBy: { deadline: 'asc' },
      }),
      prisma.governmentScheme.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getSchemeById(id: string) {
    const scheme = await prisma.governmentScheme.findUnique({
      where: { id },
      include: {
        requirements: true,
        documents: true,
      },
    });

    if (!scheme) {
      throw new Error(`Scheme with id "${id}" not found`);
    }

    return scheme;
  }

  async getUpcomingDeadlines(limit: number = 10) {
    const now = new Date();

    const schemes = await prisma.governmentScheme.findMany({
      where: {
        status: 'active',
        deadline: {
          not: null,
          gte: now,
        },
      },
      include: {
        requirements: true,
      },
      orderBy: { deadline: 'asc' },
      take: limit,
    });

    return schemes;
  }

  async getCategories() {
    const categories = await prisma.governmentScheme.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return categories.map(c => ({ name: c.category, count: c._count.id }));
  }

  async getProvinces() {
    const provinces = await prisma.governmentScheme.groupBy({
      by: ['province'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return provinces.map(p => ({ name: p.province || 'all', count: p._count.id }));
  }
}

export const schemeService = new SchemeService();
