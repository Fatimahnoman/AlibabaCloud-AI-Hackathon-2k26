import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface SearchScholarshipsFilters {
  country?: string;
  provider?: string;
  degreeLevel?: string;
  category?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

interface ScholarshipProfile {
  educationLevel?: string;
  country?: string;
  field?: string;
  nationality?: string;
}

export class ScholarshipService {
  async searchScholarships(filters: SearchScholarshipsFilters) {
    const { country, provider, degreeLevel, category, keyword, page = 1, limit = 20 } =
      filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ScholarshipWhereInput = {};

    if (country) {
      where.country = { contains: country };
    }

    if (category) {
      where.category = category;
    }

    if (provider) {
      where.provider = { contains: provider };
    }

    if (degreeLevel) {
      where.requirements = {
        some: {
          OR: [
            { requirementType: 'degree_level', requirementValue: { contains: degreeLevel } },
            { requirementType: 'program_type', requirementValue: { contains: degreeLevel } },
          ],
        },
      };
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
        { provider: { contains: keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        include: {
          requirements: true,
        },
        skip,
        take: limit,
        orderBy: { deadline: 'asc' },
      }),
      prisma.scholarship.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getScholarshipById(id: string) {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
      include: {
        requirements: true,
      },
    });

    if (!scholarship) {
      throw new Error(`Scholarship with id "${id}" not found`);
    }

    return scholarship;
  }

  async getUpcomingDeadlines(limit: number = 10) {
    const now = new Date();

    const scholarships = await prisma.scholarship.findMany({
      where: {
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

    return scholarships;
  }

  async matchScholarships(profile: ScholarshipProfile) {
    const scholarships = await prisma.scholarship.findMany({
      where: {
        OR: [
          { deadline: null },
          { deadline: { gte: new Date() } },
        ],
      },
      include: {
        requirements: true,
      },
    });

    const strong: typeof scholarships = [];
    const possible: typeof scholarships = [];
    const notEligible: typeof scholarships = [];
    const needsVerification: typeof scholarships = [];

    for (const scholarship of scholarships) {
      const matchResult = this.evaluateMatch(scholarship, profile);

      switch (matchResult) {
        case 'strong':
          strong.push(scholarship);
          break;
        case 'possible':
          possible.push(scholarship);
          break;
        case 'not-eligible':
          notEligible.push(scholarship);
          break;
        case 'needs-verification':
          needsVerification.push(scholarship);
          break;
      }
    }

    return { strong, possible, notEligible, needsVerification };
  }

  private evaluateMatch(
    scholarship: Prisma.ScholarshipGetPayload<{
      include: { requirements: true };
    }>,
    profile: ScholarshipProfile,
  ): string {
    const requirements = scholarship.requirements;
    let matchCount = 0;
    let totalChecks = 0;
    let hasBlockingMismatch = false;

    if (profile.country && scholarship.country) {
      totalChecks++;
      if (
        scholarship.country
          .toLowerCase()
          .includes(profile.country.toLowerCase())
      ) {
        matchCount++;
      } else {
        hasBlockingMismatch = true;
      }
    }

    if (profile.nationality) {
      const nationalityReq = requirements.find(
        (r) => r.requirementType === 'nationality',
      );
      if (nationalityReq) {
        totalChecks++;
        if (
          nationalityReq.requirementValue
            .toLowerCase()
            .includes(profile.nationality.toLowerCase())
        ) {
          matchCount++;
        } else {
          hasBlockingMismatch = true;
        }
      }
    }

    if (profile.educationLevel) {
      const degreeReq = requirements.find(
        (r) => r.requirementType === 'degree_level',
      );
      if (degreeReq) {
        totalChecks++;
        if (
          degreeReq.requirementValue
            .toLowerCase()
            .includes(profile.educationLevel.toLowerCase())
        ) {
          matchCount++;
        } else {
          hasBlockingMismatch = true;
        }
      }
    }

    if (profile.field) {
      const fieldReq = requirements.find(
        (r) => r.requirementType === 'field',
      );
      if (fieldReq) {
        totalChecks++;
        if (
          fieldReq.requirementValue
            .toLowerCase()
            .includes(profile.field!.toLowerCase())
        ) {
          matchCount++;
        } else {
          hasBlockingMismatch = true;
        }
      }
    }

    if (totalChecks === 0) {
      return 'needs-verification';
    }

    if (hasBlockingMismatch) {
      return 'not-eligible';
    }

    if (matchCount === totalChecks && totalChecks >= 2) {
      return 'strong';
    }

    if (matchCount >= 1) {
      return 'possible';
    }

    return 'needs-verification';
  }
}

export const scholarshipService = new ScholarshipService();
