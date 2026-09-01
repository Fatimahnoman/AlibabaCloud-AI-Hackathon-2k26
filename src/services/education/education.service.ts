import prisma from '@/lib/prisma';

export class EducationService {
  async searchUniversities(filters: { country?: string; type?: string; search?: string; department?: string }, options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.country) where.country = filters.country;
    if (filters.type) where.type = filters.type;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { city: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters.department) {
      where.courses = { some: { department: filters.department } };
    }

    const [universities, total] = await Promise.all([
      prisma.university.findMany({
        where,
        include: {
          courses: { select: { name: true, degree: true, department: true } },
          rankings: { orderBy: { year: 'desc' }, take: 1 },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.university.count({ where }),
    ]);

    return { universities, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getUniversity(id: string) {
    return prisma.university.findUnique({
      where: { id },
      include: {
        courses: { orderBy: { name: 'asc' } },
        campuses: { orderBy: { isMain: 'desc' } },
        departments: true,
        rankings: { orderBy: { year: 'desc' } },
        admissionRequirements: true,
      },
    });
  }

  async getUniversityCourses(universityId: string) {
    return prisma.course.findMany({
      where: { universityId },
      orderBy: [{ degree: 'asc' }, { name: 'asc' }],
    });
  }

  async searchScholarships(filters: { country?: string; category?: string; search?: string; deadlineAfter?: Date }, options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.country) where.country = filters.country;
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { provider: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters.deadlineAfter) {
      where.deadline = { gte: filters.deadlineAfter };
    }

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        include: { requirements: true },
        orderBy: { deadline: 'asc' },
        skip,
        take: limit,
      }),
      prisma.scholarship.count({ where }),
    ]);

    return { scholarships, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getScholarship(id: string) {
    return prisma.scholarship.findUnique({
      where: { id },
      include: { requirements: true },
    });
  }

  async checkEligibility(scholarshipId: string, userProfile: { nationality?: string; marks?: number; income?: number; degreeLevel?: string; province?: string }) {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      include: { requirements: true },
    });

    if (!scholarship) return { eligible: false, reasons: ['Scholarship not found'] };

    const reasons: string[] = [];
    let eligible = true;

    for (const req of scholarship.requirements) {
      const type = req.requirementType.toLowerCase();
      const value = req.requirementValue.toLowerCase();

      if (type === 'nationality' && userProfile.nationality) {
        if (!value.includes(userProfile.nationality.toLowerCase())) {
          eligible = false;
          reasons.push(`Nationality requirement: ${req.requirementValue}`);
        }
      }

      if (type === 'marks' || type === 'gpa' || type === 'education') {
        // Check marks requirements
        const minMarks = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (!isNaN(minMarks) && userProfile.marks !== undefined && userProfile.marks < minMarks) {
          eligible = false;
          reasons.push(`Minimum marks required: ${req.requirementValue}`);
        }
      }

      if (type === 'income' && userProfile.income !== undefined) {
        const maxIncome = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (!isNaN(maxIncome) && userProfile.income > maxIncome) {
          eligible = false;
          reasons.push(`Income exceeds maximum limit: ${req.requirementValue}`);
        }
      }

      if (type === 'degree' || type === 'education_level') {
        if (userProfile.degreeLevel && !value.includes(userProfile.degreeLevel.toLowerCase())) {
          eligible = false;
          reasons.push(`Degree level requirement: ${req.requirementValue}`);
        }
      }

      if (type === 'province' && userProfile.province) {
        if (!value.includes(userProfile.province.toLowerCase()) && !value.includes('all')) {
          eligible = false;
          reasons.push(`Province requirement: ${req.requirementValue}`);
        }
      }
    }

    if (reasons.length === 0) {
      reasons.push('Meets all documented requirements');
    }

    return { eligible, reasons, scholarship };
  }

  async getCountries() {
    return prisma.country.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getCountryInfo(countryCode: string) {
    return prisma.country.findFirst({
      where: { OR: [{ code: countryCode }, { name: { contains: countryCode } }] },
      include: {
        admissionRequirements: true,
        visaInformation: true,
      },
    });
  }

  async getAdmissionRequirements(universityId: string, courseId?: string) {
    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    else where.universityId = universityId;

    return prisma.admissionRequirement.findMany({
      where,
      orderBy: { deadline: 'asc' },
    });
  }

  async getVisaInformation(countryId: string) {
    return prisma.visaInformation.findMany({
      where: { countryId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const educationService = new EducationService();
