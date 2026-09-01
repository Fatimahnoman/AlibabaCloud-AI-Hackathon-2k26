import prisma from '@/lib/prisma';

export class SavedItemsService {
  async saveCourse(userId: string, courseId: string, notes?: string) {
    const existing = await prisma.savedCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existing) {
      throw new Error('Course is already saved');
    }

    const saved = await prisma.savedCourse.create({
      data: {
        userId,
        courseId,
        notes: notes ?? null,
      },
      include: {
        course: {
          include: {
            university: {
              select: {
                id: true,
                name: true,
                country: true,
                city: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    return saved;
  }

  async unsaveCourse(userId: string, courseId: string) {
    const existing = await prisma.savedCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!existing) {
      throw new Error('Course is not saved');
    }

    await prisma.savedCourse.delete({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
  }

  async getSavedCourses(userId: string) {
    const saved = await prisma.savedCourse.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            university: {
              select: {
                id: true,
                name: true,
                country: true,
                city: true,
                logoUrl: true,
                ranking: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved;
  }

  async saveUniversity(userId: string, universityId: string, notes?: string) {
    const existing = await prisma.savedUniversity.findUnique({
      where: {
        userId_universityId: { userId, universityId },
      },
    });

    if (existing) {
      throw new Error('University is already saved');
    }

    const saved = await prisma.savedUniversity.create({
      data: {
        userId,
        universityId,
        notes: notes ?? null,
      },
      include: {
        university: {
          include: {
            _count: { select: { courses: true } },
          },
        },
      },
    });

    return saved;
  }

  async unsaveUniversity(userId: string, universityId: string) {
    const existing = await prisma.savedUniversity.findUnique({
      where: {
        userId_universityId: { userId, universityId },
      },
    });

    if (!existing) {
      throw new Error('University is not saved');
    }

    await prisma.savedUniversity.delete({
      where: {
        userId_universityId: { userId, universityId },
      },
    });
  }

  async getSavedUniversities(userId: string) {
    const saved = await prisma.savedUniversity.findMany({
      where: { userId },
      include: {
        university: {
          include: {
            courses: {
              select: {
                id: true,
                name: true,
                degree: true,
              },
            },
            rankings: {
              orderBy: [{ year: 'desc' }, { provider: 'asc' }],
            },
            _count: { select: { courses: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved;
  }

  async saveScholarship(
    userId: string,
    scholarshipId: string,
    notes?: string,
  ) {
    const existing = await prisma.savedScholarship.findUnique({
      where: {
        userId_scholarshipId: { userId, scholarshipId },
      },
    });

    if (existing) {
      throw new Error('Scholarship is already saved');
    }

    const saved = await prisma.savedScholarship.create({
      data: {
        userId,
        scholarshipId,
        notes: notes ?? null,
      },
      include: {
        scholarship: {
          include: {
            requirements: true,
          },
        },
      },
    });

    return saved;
  }

  async unsaveScholarship(userId: string, scholarshipId: string) {
    const existing = await prisma.savedScholarship.findUnique({
      where: {
        userId_scholarshipId: { userId, scholarshipId },
      },
    });

    if (!existing) {
      throw new Error('Scholarship is not saved');
    }

    await prisma.savedScholarship.delete({
      where: {
        userId_scholarshipId: { userId, scholarshipId },
      },
    });
  }

  async getSavedScholarships(userId: string) {
    const saved = await prisma.savedScholarship.findMany({
      where: { userId },
      include: {
        scholarship: {
          include: {
            requirements: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved;
  }

  async isCourseSaved(userId: string, courseId: string) {
    const saved = await prisma.savedCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    return saved !== null;
  }

  async isUniversitySaved(userId: string, universityId: string) {
    const saved = await prisma.savedUniversity.findUnique({
      where: {
        userId_universityId: { userId, universityId },
      },
    });

    return saved !== null;
  }

  async isScholarshipSaved(userId: string, scholarshipId: string) {
    const saved = await prisma.savedScholarship.findUnique({
      where: {
        userId_scholarshipId: { userId, scholarshipId },
      },
    });

    return saved !== null;
  }
}

export const savedItemsService = new SavedItemsService();
