import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface SearchInstitutionsFilters {
  type?: string;
  province?: string;
  keyword?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class InstitutionService {
  async searchInstitutions(filters: SearchInstitutionsFilters) {
    const { type, province, keyword, status = 'active', page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.FreeInstitutionWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (province) {
      where.OR = [
        { province: 'all' },
        { province },
      ];
    }

    if (keyword) {
      where.AND = where.AND || [];
      (where.AND as Prisma.FreeInstitutionWhereInput[]).push({
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
          { eligibilityCriteria: { contains: keyword } },
        ],
      });
    }

    const [data, total] = await Promise.all([
      prisma.freeInstitution.findMany({
        where,
        include: {
          courses: true,
          entryTests: true,
          documents: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.freeInstitution.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getInstitutionById(id: string) {
    const institution = await prisma.freeInstitution.findUnique({
      where: { id },
      include: {
        courses: true,
        entryTests: true,
        documents: true,
      },
    });

    if (!institution) {
      throw new Error(`Institution with id "${id}" not found`);
    }

    return institution;
  }

  async getTypes() {
    const types = await prisma.freeInstitution.groupBy({
      by: ['type'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return types.map(t => ({ name: t.type, count: t._count.id }));
  }

  async getProvinces() {
    const provinces = await prisma.freeInstitution.groupBy({
      by: ['province'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return provinces.map(p => ({ name: p.province || 'all', count: p._count.id }));
  }
}

export const institutionService = new InstitutionService();
