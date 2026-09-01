import prisma from '@/lib/prisma';
import { TeacherProfile, StudentProfile, TeacherLessonPlan, TeacherAssessment, TeacherHomework, TeacherRubric } from '@/types';

export class TeacherService {
  async getTeacherProfile(userId: string): Promise<TeacherProfile | null> {
    const profile = await prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) return null;
    return {
      id: profile.id,
      userId: profile.userId,
      subjects: profile.subjects ? profile.subjects.split(',').map((s) => s.trim()) : [],
      qualifications: profile.qualifications ?? undefined,
      experience: profile.experience ?? undefined,
      hourlyRate: profile.hourlyRate ? Number(profile.hourlyRate) : undefined,
      currency: profile.currency ?? undefined,
      rating: profile.rating ? Number(profile.rating) : undefined,
      totalStudents: profile.totalStudents,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async createTeacherProfile(userId: string, data: Partial<TeacherProfile>): Promise<TeacherProfile> {
    const subjects = data.subjects?.join(', ') ?? '';
    const profile = await prisma.teacherProfile.upsert({
      where: { userId },
      create: {
        userId,
        subjects,
        qualifications: data.qualifications,
        experience: data.experience,
        hourlyRate: data.hourlyRate,
        currency: data.currency,
        totalStudents: data.totalStudents ?? 0,
      },
      update: {
        subjects,
        qualifications: data.qualifications,
        experience: data.experience,
        hourlyRate: data.hourlyRate,
        currency: data.currency,
        ...(data.totalStudents !== undefined ? { totalStudents: data.totalStudents } : {}),
      },
    });
    return {
      id: profile.id,
      userId: profile.userId,
      subjects: profile.subjects ? profile.subjects.split(',').map((s) => s.trim()) : [],
      qualifications: profile.qualifications ?? undefined,
      experience: profile.experience ?? undefined,
      hourlyRate: profile.hourlyRate ? Number(profile.hourlyRate) : undefined,
      currency: profile.currency ?? undefined,
      rating: profile.rating ? Number(profile.rating) : undefined,
      totalStudents: profile.totalStudents,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async getStudentProfiles(_teacherId: string): Promise<StudentProfile[]> {
    return [];
  }

  async generateLessonPlan(
    userId: string,
    subject: string,
    topic: string,
    grade: string,
    durationMin: number
  ): Promise<TeacherLessonPlan> {
    const content = JSON.stringify({
      introduction: {
        title: `Introduction to ${topic}`,
        duration: `${Math.round(durationMin * 0.15)} minutes`,
        description: `Opening activity to engage students and introduce the topic of ${topic} in ${subject}.`,
      },
      mainContent: {
        title: `Core Concepts of ${topic}`,
        duration: `${Math.round(durationMin * 0.5)} minutes`,
        sections: [
          { heading: 'Key Definitions', content: `Important terms and definitions related to ${topic}.` },
          { heading: 'Core Principles', content: `Fundamental principles underlying ${topic}.` },
          { heading: 'Examples', content: `Practical examples illustrating ${topic}.` },
        ],
      },
      activities: {
        title: 'Interactive Activities',
        duration: `${Math.round(durationMin * 0.25)} minutes`,
        items: [
          { type: 'discussion', description: `Group discussion on ${topic} concepts.` },
          { type: 'practice', description: `Hands-on practice exercises for ${topic}.` },
          { type: 'reflection', description: `Individual reflection on key takeaways from ${topic}.` },
        ],
      },
      conclusion: {
        title: 'Conclusion',
        duration: `${Math.round(durationMin * 0.1)} minutes`,
        description: `Review of key points and summary of ${topic}.`,
      },
    });

    const objectives = JSON.stringify([
      `Understand the core concepts of ${topic}`,
      `Apply ${topic} principles in real-world scenarios`,
      `Analyze and evaluate ${topic}-related problems`,
    ]);

    const materials = JSON.stringify([
      `Textbook chapters on ${topic}`,
      `Printed worksheets for ${topic}`,
      `Presentation slides for ${subject} - ${topic}`,
    ]);

    const lessonPlan = await prisma.teacherLessonPlan.create({
      data: {
        userId,
        subject,
        topic,
        grade,
        durationMin,
        content,
        objectives,
        materials,
        assessment: `Formative assessment on ${topic} concepts`,
      },
    });

    return {
      id: lessonPlan.id,
      userId: lessonPlan.userId,
      subject: lessonPlan.subject,
      topic: lessonPlan.topic,
      grade: lessonPlan.grade,
      durationMin: lessonPlan.durationMin,
      content: lessonPlan.content,
      objectives: lessonPlan.objectives ?? undefined,
      materials: lessonPlan.materials ?? undefined,
      assessment: lessonPlan.assessment ?? undefined,
      createdAt: lessonPlan.createdAt,
      updatedAt: lessonPlan.updatedAt,
    };
  }

  async generateAssessment(
    userId: string,
    subject: string,
    topic: string,
    difficulty: string,
    questionCount: number
  ): Promise<TeacherAssessment> {
    const questions = Array.from({ length: questionCount }, (_, i) => ({
      question: `Question ${i + 1}: What is a key aspect of ${topic}?`,
      options: [
        `Definition of ${topic}`,
        `History of ${topic}`,
        `Unrelated concept A`,
        `Unrelated concept B`,
      ],
      correctAnswer: 0,
      explanation: `This relates to the fundamental understanding of ${topic} in ${subject}.`,
    }));

    const content = JSON.stringify({ questions });

    const answerKey = JSON.stringify(
      questions.map((q, i) => ({
        questionNumber: i + 1,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }))
    );

    const assessment = await prisma.teacherAssessment.create({
      data: {
        userId,
        subject,
        topic,
        difficulty,
        questionCount,
        content,
        answerKey,
      },
    });

    return {
      id: assessment.id,
      userId: assessment.userId,
      subject: assessment.subject,
      topic: assessment.topic,
      difficulty: assessment.difficulty,
      questionCount: assessment.questionCount,
      content: assessment.content,
      answerKey: assessment.answerKey ?? undefined,
      createdAt: assessment.createdAt,
    };
  }

  async generateHomework(
    userId: string,
    subject: string,
    topic: string,
    grade: string,
    title: string,
    description: string,
    dueDays: number
  ): Promise<TeacherHomework> {
    const homework = await prisma.teacherHomework.create({
      data: {
        userId,
        subject,
        topic,
        grade,
        title,
        description,
        dueDays,
      },
    });

    return {
      id: homework.id,
      userId: homework.userId,
      subject: homework.subject,
      topic: homework.topic,
      grade: homework.grade,
      title: homework.title,
      description: homework.description,
      dueDays: homework.dueDays,
      createdAt: homework.createdAt,
    };
  }

  async generateRubric(
    userId: string,
    title: string,
    subject: string,
    assessmentType: string,
    criteria: string,
    totalPoints: number
  ): Promise<TeacherRubric> {
    const rubric = await prisma.teacherRubric.create({
      data: {
        userId,
        title,
        subject,
        assessmentType,
        criteria,
        totalPoints,
      },
    });

    return {
      id: rubric.id,
      userId: rubric.userId,
      title: rubric.title,
      subject: rubric.subject,
      assessmentType: rubric.assessmentType,
      criteria: rubric.criteria,
      totalPoints: rubric.totalPoints,
      createdAt: rubric.createdAt,
    };
  }

  async getLessonPlans(
    userId: string,
    subject?: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ data: TeacherLessonPlan[]; total: number; page: number; limit: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (subject) where.subject = subject;

    const [plans, total] = await Promise.all([
      prisma.teacherLessonPlan.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.teacherLessonPlan.count({ where }),
    ]);

    return {
      data: plans.map((p) => ({
        id: p.id,
        userId: p.userId,
        subject: p.subject,
        topic: p.topic,
        grade: p.grade,
        durationMin: p.durationMin,
        content: p.content,
        objectives: p.objectives ?? undefined,
        materials: p.materials ?? undefined,
        assessment: p.assessment ?? undefined,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getAssessments(
    userId: string,
    subject?: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ data: TeacherAssessment[]; total: number; page: number; limit: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (subject) where.subject = subject;

    const [assessments, total] = await Promise.all([
      prisma.teacherAssessment.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.teacherAssessment.count({ where }),
    ]);

    return {
      data: assessments.map((a) => ({
        id: a.id,
        userId: a.userId,
        subject: a.subject,
        topic: a.topic,
        difficulty: a.difficulty,
        questionCount: a.questionCount,
        content: a.content,
        answerKey: a.answerKey ?? undefined,
        createdAt: a.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getHomework(
    userId: string,
    subject?: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ data: TeacherHomework[]; total: number; page: number; limit: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (subject) where.subject = subject;

    const [homework, total] = await Promise.all([
      prisma.teacherHomework.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.teacherHomework.count({ where }),
    ]);

    return {
      data: homework.map((h) => ({
        id: h.id,
        userId: h.userId,
        subject: h.subject,
        topic: h.topic,
        grade: h.grade,
        title: h.title,
        description: h.description,
        dueDays: h.dueDays,
        createdAt: h.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getRubrics(userId: string): Promise<TeacherRubric[]> {
    const rubrics = await prisma.teacherRubric.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rubrics.map((r) => ({
      id: r.id,
      userId: r.userId,
      title: r.title,
      subject: r.subject,
      assessmentType: r.assessmentType,
      criteria: r.criteria,
      totalPoints: r.totalPoints,
      createdAt: r.createdAt,
    }));
  }

  async deleteLessonPlan(planId: string, userId: string): Promise<boolean> {
    const plan = await prisma.teacherLessonPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.userId !== userId) return false;
    await prisma.teacherLessonPlan.delete({ where: { id: planId } });
    return true;
  }

  async deleteAssessment(assessmentId: string, userId: string): Promise<boolean> {
    const assessment = await prisma.teacherAssessment.findUnique({ where: { id: assessmentId } });
    if (!assessment || assessment.userId !== userId) return false;
    await prisma.teacherAssessment.delete({ where: { id: assessmentId } });
    return true;
  }
}

export const teacherService = new TeacherService();
