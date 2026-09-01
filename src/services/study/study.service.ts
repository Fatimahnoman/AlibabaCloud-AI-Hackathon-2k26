import prisma from '@/lib/prisma';
import { LearningProfile, StudyPlan } from '@/types';

export class StudyService {
  async getLearningProfile(userId: string): Promise<LearningProfile | null> {
    const profile = await prisma.learningProfile.findUnique({
      where: { userId },
    });
    if (!profile) return null;
    return {
      id: profile.id,
      userId: profile.userId,
      educationLevel: profile.educationLevel ?? undefined,
      subjects: profile.subjects ? JSON.parse(profile.subjects) : undefined,
      weakSubjects: profile.weakSubjects ? JSON.parse(profile.weakSubjects) : undefined,
      learningStyle: profile.learningStyle ?? undefined,
      studyHoursPerDay: profile.studyHoursPerDay ?? undefined,
      targetExam: profile.targetExam ?? undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async createLearningProfile(userId: string, data: Partial<LearningProfile>): Promise<LearningProfile> {
    const existing = await prisma.learningProfile.findUnique({ where: { userId } });

    const updateData: Record<string, unknown> = {};
    if (data.educationLevel !== undefined) updateData.educationLevel = data.educationLevel;
    if (data.subjects !== undefined) updateData.subjects = JSON.stringify(data.subjects);
    if (data.weakSubjects !== undefined) updateData.weakSubjects = JSON.stringify(data.weakSubjects);
    if (data.learningStyle !== undefined) updateData.learningStyle = data.learningStyle;
    if (data.studyHoursPerDay !== undefined) updateData.studyHoursPerDay = data.studyHoursPerDay;
    if (data.targetExam !== undefined) updateData.targetExam = data.targetExam;

    const profile = existing
      ? await prisma.learningProfile.update({ where: { userId }, data: updateData })
      : await prisma.learningProfile.create({ data: { userId, ...updateData } });

    return {
      id: profile.id,
      userId: profile.userId,
      educationLevel: profile.educationLevel ?? undefined,
      subjects: profile.subjects ? JSON.parse(profile.subjects) : undefined,
      weakSubjects: profile.weakSubjects ? JSON.parse(profile.weakSubjects) : undefined,
      learningStyle: profile.learningStyle ?? undefined,
      studyHoursPerDay: profile.studyHoursPerDay ?? undefined,
      targetExam: profile.targetExam ?? undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async createStudyPlan(
    userId: string,
    data: { title: string; description?: string; startDate: Date; endDate: Date }
  ): Promise<StudyPlan> {
    const existingProfile = await prisma.learningProfile.findUnique({ where: { userId } });

    const profile = existingProfile
      ? existingProfile
      : await prisma.learningProfile.create({ data: { userId } });

    const plan = await prisma.studyPlan.create({
      data: {
        userId,
        learningProfileId: profile.id,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    return {
      id: plan.id,
      userId: plan.userId,
      learningProfileId: plan.learningProfileId,
      title: plan.title,
      description: plan.description ?? undefined,
      startDate: plan.startDate,
      endDate: plan.endDate,
      status: plan.status as 'active' | 'completed' | 'paused',
      schedule: plan.schedule ? JSON.parse(plan.schedule) : undefined,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  async getStudyPlans(userId: string, status?: string): Promise<StudyPlan[]> {
    const plans = await prisma.studyPlan.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan) => ({
      id: plan.id,
      userId: plan.userId,
      learningProfileId: plan.learningProfileId,
      title: plan.title,
      description: plan.description ?? undefined,
      startDate: plan.startDate,
      endDate: plan.endDate,
      status: plan.status as 'active' | 'completed' | 'paused',
      schedule: plan.schedule ? JSON.parse(plan.schedule) : undefined,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  }

  async updateStudyPlan(planId: string, userId: string, data: Partial<StudyPlan>): Promise<StudyPlan> {
    const existing = await prisma.studyPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!existing) {
      throw new Error('Study plan not found or access denied');
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.schedule !== undefined) updateData.schedule = JSON.stringify(data.schedule);

    const plan = await prisma.studyPlan.update({
      where: { id: planId },
      data: updateData,
    });

    return {
      id: plan.id,
      userId: plan.userId,
      learningProfileId: plan.learningProfileId,
      title: plan.title,
      description: plan.description ?? undefined,
      startDate: plan.startDate,
      endDate: plan.endDate,
      status: plan.status as 'active' | 'completed' | 'paused',
      schedule: plan.schedule ? JSON.parse(plan.schedule) : undefined,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  async deleteStudyPlan(planId: string, userId: string): Promise<void> {
    const existing = await prisma.studyPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!existing) {
      throw new Error('Study plan not found or access denied');
    }

    await prisma.studyPlan.delete({ where: { id: planId } });
  }

  async getWeakSubjects(userId: string): Promise<{ subject: string; score: number; recommendations: string }[]> {
    const topics = await prisma.studyTopic.findMany({
      where: {
        userId,
        masteryLevel: { lt: 50 },
      },
      orderBy: { masteryLevel: 'asc' },
    });

    return topics.map((topic) => {
      const mastery = topic.masteryLevel;
      const daysSince = topic.lastStudiedAt
        ? Math.floor((Date.now() - new Date(topic.lastStudiedAt).getTime()) / 86400000)
        : 999;

      let recommendation: string;
      if (mastery < 20) {
        recommendation = `"${topic.topic}" needs urgent attention (${mastery}% mastery). Start with fundamentals: read core concepts, watch tutorial videos, then do 10+ practice problems.`;
      } else if (mastery < 35) {
        recommendation = `"${topic.topic}" is weak (${mastery}% mastery). Review notes, solve practice questions daily, and take a mini-quiz to track improvement.`;
      } else if (mastery < 50) {
        recommendation = `"${topic.topic}" needs more work (${mastery}% mastery). Focus on weak sub-topics, try teaching the concept to someone else, and attempt past exam questions.`;
      } else {
        recommendation = `"${topic.topic}" is developing (${mastery}% mastery). Regular revision and harder problems will push this higher.`;
      }

      if (daysSince > 14) {
        recommendation += ` Last studied ${daysSince} days ago — revision overdue!`;
      }

      return {
        subject: topic.subject,
        score: mastery,
        recommendations: recommendation,
      };
    });
  }

  async generateDailyPlan(planId: string, date: Date): Promise<Record<string, unknown>[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await prisma.dailySchedule.findMany({
      where: {
        planId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return entries.map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      planId: entry.planId,
      date: entry.date,
      subject: entry.subject,
      startTime: entry.startTime,
      endTime: entry.endTime,
      activity: entry.activity,
      isCompleted: entry.isCompleted,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));
  }

  async logStudySession(
    userId: string,
    data: { subject: string; topic?: string; durationMin: number; startTime: Date; endTime?: Date; notes?: string; rating?: number }
  ) {
    const session = await prisma.studySession.create({
      data: {
        userId,
        subject: data.subject,
        topic: data.topic,
        durationMin: data.durationMin,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        rating: data.rating,
      },
    });

    const topicRecord = data.topic
      ? await prisma.studyTopic.findUnique({
          where: { userId_subject_topic: { userId, subject: data.subject, topic: data.topic } },
        })
      : null;

    if (topicRecord) {
      // Mastery increment based on session duration: 30min = +3, 60min = +5, capped at +8
      const increment = Math.min(8, Math.max(2, Math.round(data.durationMin / 12)));
      const newMastery = Math.min(topicRecord.masteryLevel + increment, 100);
      await prisma.studyTopic.update({
        where: { id: topicRecord.id },
        data: { masteryLevel: newMastery, lastStudiedAt: new Date() },
      });
    } else if (data.topic) {
      await prisma.studyTopic.create({
        data: {
          userId,
          subject: data.subject,
          topic: data.topic,
          masteryLevel: 1,
          lastStudiedAt: new Date(),
        },
      });
    }

    return session;
  }

  async getStudySessions(
    userId: string,
    options?: { subject?: string; page?: number; pageSize?: number }
  ) {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { userId };
    if (options?.subject) where.subject = options.subject;

    const [sessions, total] = await prisma.$transaction([
      prisma.studySession.findMany({
        where,
        orderBy: { startTime: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.studySession.count({ where }),
    ]);

    return {
      sessions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getStudyTopics(userId: string, subject?: string) {
    return prisma.studyTopic.findMany({
      where: {
        userId,
        ...(subject ? { subject } : {}),
      },
      orderBy: [{ priority: 'asc' }, { masteryLevel: 'asc' }],
    });
  }

  async upsertStudyTopic(userId: string, subject: string, topic: string, priority?: string) {
    return prisma.studyTopic.upsert({
      where: { userId_subject_topic: { userId, subject, topic } },
      create: {
        userId,
        subject,
        topic,
        priority: priority ?? 'medium',
      },
      update: {
        ...(priority ? { priority } : {}),
      },
    });
  }

  async getDailySchedule(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.dailySchedule.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async createDailySchedule(
    userId: string,
    data: { planId?: string; date: Date; subject: string; startTime: string; endTime: string; activity: string }
  ) {
    return prisma.dailySchedule.create({
      data: {
        userId,
        planId: data.planId,
        date: data.date,
        subject: data.subject,
        startTime: data.startTime,
        endTime: data.endTime,
        activity: data.activity,
      },
    });
  }

  async getWeeklyStudySummary(userId: string, weekStart?: Date) {
    const start = weekStart ? new Date(weekStart) : new Date();
    if (!weekStart) {
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
    }
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setHours(0, 0, 0, 0);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        startTime: {
          gte: start,
          lt: end,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMin, 0);

    const subjectMap = new Map<string, { minutes: number; sessions: number }>();
    for (const session of sessions) {
      const existing = subjectMap.get(session.subject) ?? { minutes: 0, sessions: 0 };
      existing.minutes += session.durationMin;
      existing.sessions += 1;
      subjectMap.set(session.subject, existing);
    }

    const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
      subject,
      minutes: stats.minutes,
      sessions: stats.sessions,
    }));

    return {
      weekStart: start,
      weekEnd: end,
      totalMinutes,
      totalSessions: sessions.length,
      subjectBreakdown,
    };
  }
}

export const studyService = new StudyService();
