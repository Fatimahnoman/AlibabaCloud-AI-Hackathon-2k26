import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface SearchCareerPathsFilters {
  field?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

// Map user-friendly field names to DB field names
const FIELD_MAP: Record<string, string[]> = {
  Technology: ['Computer Science', 'Data Science', 'Software Engineering', 'IT', 'Information Technology'],
  Healthcare: ['Medicine', 'Nursing', 'Pharmacy', 'Public Health', 'Dentistry', 'Healthcare'],
  Business: ['Business', 'Business/Economics', 'Economics', 'Finance', 'Marketing', 'Accounting'],
  Engineering: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering', 'Engineering'],
  Arts: ['Arts', 'Fine Arts', 'Design', 'Media', 'Journalism', 'Psychology', 'Social Sciences'],
  Education: ['Education', 'Teaching'],
  Law: ['Law', 'Legal Studies'],
  Science: ['Science', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Environmental Science', 'General'],
};

function parseJsonField(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    // If not JSON, split by comma
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

export class CareerGuidanceService {
  async getCareerPaths(filters: SearchCareerPathsFilters) {
    const { field, keyword, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.CareerPathWhereInput = {};

    if (field) {
      const dbFields = FIELD_MAP[field] || [field];
      where.OR = dbFields.map((f) => ({ field: { contains: f } }));
    }

    if (keyword) {
      where.OR = [
        ...(where.OR || []),
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { field: { contains: keyword } },
        { skills: { contains: keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.careerPath.findMany({
        where,
        orderBy: { title: 'asc' },
        skip,
        take: limit,
      }),
      prisma.careerPath.count({ where }),
    ]);

    // Parse JSON string fields to arrays
    const parsed = data.map((d) => ({
      ...d,
      skills: parseJsonField(d.skills),
      entryRoles: parseJsonField(d.entryRoles),
      certifications: parseJsonField(d.certifications),
      furtherStudy: parseJsonField(d.furtherStudy),
    }));

    return { data: parsed, total, page, limit };
  }

  async getCareerPathBySlug(slug: string) {
    const careerPath = await prisma.careerPath.findUnique({
      where: { slug },
    });

    if (!careerPath) {
      throw new Error(`Career path with slug "${slug}" not found`);
    }

    return {
      ...careerPath,
      skills: parseJsonField(careerPath.skills),
      entryRoles: parseJsonField(careerPath.entryRoles),
      certifications: parseJsonField(careerPath.certifications),
      furtherStudy: parseJsonField(careerPath.furtherStudy),
    };
  }

  async getCareerPathsByField(field: string) {
    const dbFields = FIELD_MAP[field] || [field];
    const careerPaths = await prisma.careerPath.findMany({
      where: {
        OR: dbFields.map((f) => ({ field: { contains: f } })),
      },
      orderBy: { title: 'asc' },
    });

    return careerPaths.map((d) => ({
      ...d,
      skills: parseJsonField(d.skills),
      entryRoles: parseJsonField(d.entryRoles),
    }));
  }

  async getCareersAfterDegree(degreeName: string, field?: string) {
    const where: Prisma.CareerPathWhereInput = {};

    if (field) {
      const dbFields = FIELD_MAP[field] || [field];
      where.OR = dbFields.map((f) => ({ field: { contains: f } }));
    }

    where.OR = [
      ...(where.OR || []),
      { title: { contains: degreeName } },
      { description: { contains: degreeName } },
      { entryRoles: { contains: degreeName } },
      { furtherStudy: { contains: degreeName } },
    ];

    const careerPaths = await prisma.careerPath.findMany({
      where,
      orderBy: { title: 'asc' },
    });

    if (careerPaths.length === 0 && field) {
      const dbFields = FIELD_MAP[field] || [field];
      const fallbackPaths = await prisma.careerPath.findMany({
        where: {
          OR: dbFields.map((f) => ({ field: { contains: f } })),
        },
        orderBy: { title: 'asc' },
      });

      return fallbackPaths.map((d) => ({
        ...d,
        skills: parseJsonField(d.skills),
        entryRoles: parseJsonField(d.entryRoles),
      }));
    }

    return careerPaths.map((d) => ({
      ...d,
      skills: parseJsonField(d.skills),
      entryRoles: parseJsonField(d.entryRoles),
    }));
  }
}

export const careerGuidanceService = new CareerGuidanceService();
