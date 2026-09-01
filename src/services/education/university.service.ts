import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface SearchUniversitiesFilters {
  country?: string;
  city?: string;
  type?: string;
  sector?: string;
  field?: string;
  department?: string;
  program?: string;
  keyword?: string;
  universityId?: string;
  hasCampuses?: boolean;
  page?: number;
  limit?: number;
}

export class UniversityService {
  async searchUniversities(filters: SearchUniversitiesFilters) {
    const { country, city, type, sector, field, department, program, keyword, universityId, hasCampuses, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.UniversityWhereInput = {};

    if (country) {
      where.country = { contains: country };
    }

    if (city) {
      where.city = { contains: city };
    }

    if (type) {
      where.type = { equals: type };
    }

    if (sector) {
      where.sector = { equals: sector };
    }

    if (universityId) {
      where.id = { equals: universityId };
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    if (field) {
      where.courses = {
        some: {
          OR: [
            { name: { contains: field } },
            { degree: { contains: field } },
            { description: { contains: field } },
          ],
        },
      };
    }

    if (hasCampuses) {
      where.campuses = { some: {} };
    }

    const courseFilters: Prisma.CourseWhereInput[] = [];
    if (department) {
      courseFilters.push({ department: { equals: department } });
    }
    if (program) {
      courseFilters.push({ name: { equals: program } });
    }
    if (courseFilters.length > 0) {
      where.courses = { some: { AND: courseFilters } };
    }

    const [data, total] = await Promise.all([
      prisma.university.findMany({
        where,
        include: {
          _count: { select: { courses: true, campuses: true } },
        },
        skip,
        take: limit,
        orderBy: [
          { ranking: 'asc' },
          { name: 'asc' },
        ],
      }),
      prisma.university.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getCities(filters: { country?: string; type?: string; sector?: string }): Promise<string[]> {
    const where: Prisma.UniversityWhereInput = {};
    if (filters.country) where.country = { contains: filters.country };
    if (filters.type) where.type = { equals: filters.type };
    if (filters.sector) where.sector = { equals: filters.sector };
    where.city = { not: null };

    const results = await prisma.university.findMany({
      where,
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });

    return results.map((r) => r.city).filter((c): c is string => c !== null);
  }

  async getInstitutionTypes(filters: { country?: string; city?: string }): Promise<string[]> {
    const where: Prisma.UniversityWhereInput = {};
    if (filters.country) where.country = { contains: filters.country };
    if (filters.city) where.city = { contains: filters.city };

    const results = await prisma.university.findMany({
      where,
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' },
    });
    return results.map((r) => r.type);
  }

  async getSectors(filters: { country?: string; city?: string; type?: string }): Promise<string[]> {
    const where: Prisma.UniversityWhereInput = {};
    if (filters.country) where.country = { contains: filters.country };
    if (filters.city) where.city = { contains: filters.city };
    if (filters.type) where.type = { equals: filters.type };

    const results = await prisma.university.findMany({
      where,
      select: { sector: true },
      distinct: ['sector'],
      orderBy: { sector: 'asc' },
    });
    return results.map((r) => r.sector).filter((s): s is string => s !== null);
  }

  async getUniversityById(id: string) {
    const uni = await prisma.university.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: { name: 'asc' },
        },
        rankings: {
          orderBy: { position: 'asc' },
        },
        admissionRequirements: true,
        campuses: {
          orderBy: [{ isMain: 'desc' }, { name: 'asc' }],
        },
        departments: {
          orderBy: { name: 'asc' },
        },
      },
    });
    return uni;
  }

  async getUniversityRankings(universityId: string) {
    return prisma.universityRanking.findMany({
      where: { universityId },
      orderBy: { year: 'desc' },
    });
  }

  async getCountries(): Promise<string[]> {
    const results = await prisma.university.findMany({
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    });
    return results.map((r) => r.country);
  }

  async getDepartments(filters: { country?: string; city?: string; type?: string; sector?: string; universityId?: string }): Promise<string[]> {
    const { country, city, type, sector, universityId } = filters;

    const deptWhere: Prisma.DepartmentWhereInput = {};
    if (universityId) {
      deptWhere.universityId = universityId;
    } else {
      const uniWhere: Prisma.UniversityWhereInput = {};
      if (country) uniWhere.country = { contains: country };
      if (city) uniWhere.city = { contains: city };
      if (type) uniWhere.type = { equals: type };
      if (sector) uniWhere.sector = { equals: sector };
      deptWhere.university = uniWhere;
    }

    const departments = await prisma.department.findMany({
      where: deptWhere,
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    });

    return departments.map(d => d.name);
  }

  async getPrograms(filters: { country?: string; city?: string; type?: string; sector?: string; universityId?: string; department?: string }): Promise<string[]> {
    const { country, city, type, sector, universityId, department } = filters;

    const courseWhere: Prisma.CourseWhereInput = {};
    if (universityId) {
      courseWhere.universityId = universityId;
    } else {
      const uniWhere: Prisma.UniversityWhereInput = {};
      if (country) uniWhere.country = { contains: country };
      if (city) uniWhere.city = { contains: city };
      if (type) uniWhere.type = { equals: type };
      if (sector) uniWhere.sector = { equals: sector };
      courseWhere.university = uniWhere;
    }

    if (department) {
      courseWhere.department = { equals: department };
    }

    const courses = await prisma.course.findMany({
      where: courseWhere,
      select: { degree: true },
      distinct: ['degree'],
      orderBy: { degree: 'asc' },
    });

    return courses.map((c) => c.degree);
  }

  async compareUniversities(ids: string[]) {
    if (ids.length < 1 || ids.length > 4) {
      throw new Error('Compare requires 1-4 university IDs');
    }

    return prisma.university.findMany({
      where: { id: { in: ids } },
      include: {
        courses: {
          select: {
            name: true,
            degree: true,
            tuitionFee: true,
            currency: true,
          },
        },
        rankings: true,
        admissionRequirements: true,
        campuses: {
          select: {
            name: true,
            city: true,
            isMain: true,
          },
          orderBy: { isMain: 'desc' },
        },
      },
    });
  }
}

export const universityService = new UniversityService();
