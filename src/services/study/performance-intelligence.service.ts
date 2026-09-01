import prisma from '@/lib/prisma';
import type {
  PracticeQuiz,
  RevisionPlan,
  SubjectPerformance,
  TopicPerformance,
  PerformanceDiagnostic,
  PerformanceOverview,
} from '@/types/education-student';

export class PerformanceIntelligenceService {
  async logQuiz(userId: string, data: {
    subject: string;
    topic: string;
    title: string;
    totalMarks: number;
    scoredMarks: number;
    timeTakenMin?: number;
    notes?: string;
  }): Promise<PracticeQuiz> {
    const percentage = Math.round((data.scoredMarks / data.totalMarks) * 100);
    const quiz = await prisma.practiceQuiz.create({
      data: {
        userId,
        subject: data.subject,
        topic: data.topic,
        title: data.title,
        totalMarks: data.totalMarks,
        scoredMarks: data.scoredMarks,
        percentage,
        timeTakenMin: data.timeTakenMin || null,
        notes: data.notes || null,
      },
    });

    await prisma.performanceMetric.create({
      data: {
        userId,
        subject: data.subject,
        topic: data.topic,
        metricType: 'quiz_score',
        value: percentage,
        metadataJson: JSON.stringify({ quizId: quiz.id, title: data.title }),
      },
    });

    if (percentage >= 80) {
      const topic = await prisma.studyTopic.findFirst({
        where: { userId, subject: data.subject, topic: data.topic },
      });
      if (topic) {
        await prisma.studyTopic.update({
          where: { id: topic.id },
          data: { masteryLevel: Math.min(100, topic.masteryLevel + 5), lastStudiedAt: new Date() },
        });
      }
    } else if (percentage < 50) {
      await this.flagForRevision(userId, data.subject, data.topic);
    }

    return this.formatQuiz(quiz);
  }

  async getQuizzes(userId: string, options?: { subject?: string; topic?: string; page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { userId };
    if (options?.subject) where.subject = options.subject;
    if (options?.topic) where.topic = options.topic;

    const [quizzes, total] = await Promise.all([
      prisma.practiceQuiz.findMany({ where, orderBy: { studiedAt: 'desc' }, skip, take: limit }),
      prisma.practiceQuiz.count({ where }),
    ]);

    return {
      data: quizzes.map(q => this.formatQuiz(q)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async flagForRevision(userId: string, subject: string, topic: string, notes?: string): Promise<RevisionPlan> {
    const existingTopic = await prisma.studyTopic.findFirst({
      where: { userId, subject, topic },
    });

    const existing = await prisma.revisionPlan.findFirst({
      where: { userId, subject, topic },
    });

    if (existing) {
      const updated = await prisma.revisionPlan.update({
        where: { id: existing.id },
        data: {
          revisionCount: existing.revisionCount + 1,
          nextRevision: this.calculateNextRevision(existing.revisionCount + 1),
          status: 'pending',
          notes: notes || existing.notes,
        },
      });
      return this.formatRevision(updated);
    }

    const created = await prisma.revisionPlan.create({
      data: {
        userId,
        subject,
        topic,
        masteryAtCreation: existingTopic?.masteryLevel || 0,
        notes: notes || null,
        nextRevision: this.calculateNextRevision(1),
      },
    });
    return this.formatRevision(created);
  }

  async getRevisionPlans(userId: string, options?: { status?: string; subject?: string }) {
    const where: Record<string, unknown> = { userId };
    if (options?.status) where.status = options.status;
    if (options?.subject) where.subject = options.subject;

    const plans = await prisma.revisionPlan.findMany({ where, orderBy: { nextRevision: 'asc' } });
    return plans.map(p => this.formatRevision(p));
  }

  async updateRevisionStatus(revisionId: string, userId: string, status: string): Promise<RevisionPlan> {
    const plan = await prisma.revisionPlan.findFirst({ where: { id: revisionId, userId } });
    if (!plan) throw new Error('Revision plan not found');
    const updated = await prisma.revisionPlan.update({ where: { id: revisionId }, data: { status } });
    return this.formatRevision(updated);
  }

  async deleteRevisionPlan(revisionId: string, userId: string): Promise<boolean> {
    const plan = await prisma.revisionPlan.findFirst({ where: { id: revisionId, userId } });
    if (!plan) return false;
    await prisma.revisionPlan.delete({ where: { id: revisionId } });
    return true;
  }

  async getPerformanceOverview(userId: string): Promise<PerformanceOverview> {
    const [topics, sessions, quizzes, _revisions] = await Promise.all([
      prisma.studyTopic.findMany({ where: { userId } }),
      prisma.studySession.findMany({ where: { userId }, orderBy: { startTime: 'desc' } }),
      prisma.practiceQuiz.findMany({ where: { userId }, orderBy: { studiedAt: 'desc' } }),
      prisma.revisionPlan.findMany({ where: { userId } }),
    ]);

    const subjectMap = new Map<string, { sessions: typeof sessions; topics: typeof topics; quizzes: typeof quizzes }>();

    for (const s of sessions) {
      const arr = subjectMap.get(s.subject) || { sessions: [], topics: [], quizzes: [] };
      arr.sessions.push(s);
      subjectMap.set(s.subject, arr);
    }
    for (const t of topics) {
      const arr = subjectMap.get(t.subject) || { sessions: [], topics: [], quizzes: [] };
      arr.topics.push(t);
      subjectMap.set(t.subject, arr);
    }
    for (const q of quizzes) {
      const arr = subjectMap.get(q.subject) || { sessions: [], topics: [], quizzes: [] };
      arr.quizzes.push(q);
      subjectMap.set(q.subject, arr);
    }

    const subjects: SubjectPerformance[] = [];
    for (const [subject, data] of subjectMap) {
      const totalMinutes = data.sessions.reduce((s, sess) => s + sess.durationMin, 0);
      const ratings = data.sessions.filter(s => s.rating).map(s => s.rating!);
      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const quizScores = data.quizzes.map(q => q.percentage);
      const avgQuiz = quizScores.length ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0;

      const recentScores = quizScores.slice(0, 5);
      const olderScores = quizScores.slice(5, 10);
      const recentAvg = recentScores.length ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : avgQuiz;
      const olderAvg = olderScores.length ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : avgQuiz;

      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      let trendPct = 0;
      if (olderAvg > 0) {
        trendPct = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
        if (trendPct > 5) trend = 'improving';
        else if (trendPct < -5) trend = 'declining';
      }

      const dist = [
        { level: 'Beginner (0-30)', count: 0 },
        { level: 'Developing (31-60)', count: 0 },
        { level: 'Proficient (61-80)', count: 0 },
        { level: 'Mastered (81-100)', count: 0 },
      ];

      const topicPerf: TopicPerformance[] = data.topics.map(t => {
        const tSessions = data.sessions.filter(s => s.topic === t.topic);
        const tQuizzes = data.quizzes.filter(q => q.topic === t.topic);
        const tQuizAvg = tQuizzes.length ? tQuizzes.reduce((a, b) => a + b.percentage, 0) / tQuizzes.length : 0;

        if (t.masteryLevel <= 30) dist[0].count++;
        else if (t.masteryLevel <= 60) dist[1].count++;
        else if (t.masteryLevel <= 80) dist[2].count++;
        else dist[3].count++;

        const daysSince = t.lastStudiedAt ? Math.floor((Date.now() - new Date(t.lastStudiedAt).getTime()) / 86400000) : 999;
        let diagnostic = '';
        if (t.masteryLevel < 30) diagnostic = `Needs significant work. Mastery: ${t.masteryLevel}%. Focus on fundamentals.`;
        else if (t.masteryLevel < 60) diagnostic = `Developing. Mastery: ${t.masteryLevel}%. Regular practice recommended.`;
        else if (t.masteryLevel < 80) diagnostic = `Good progress. Mastery: ${t.masteryLevel}%. Refine weak areas.`;
        else diagnostic = `Strong. Mastery: ${t.masteryLevel}%. Maintain with periodic review.`;

        return {
          topic: t.topic,
          masteryLevel: t.masteryLevel,
          sessionsCount: tSessions.length,
          averageQuizScore: tQuizAvg,
          lastStudiedAt: t.lastStudiedAt || undefined,
          needsRevision: t.masteryLevel < 50 || daysSince > 14,
          diagnostic,
        };
      });

      subjects.push({
        subject,
        totalSessions: data.sessions.length,
        totalMinutes,
        averageRating: Math.round(avgRating * 10) / 10,
        averageQuizScore: Math.round(avgQuiz),
        masteryDistribution: dist,
        trend,
        trendPercentage: trendPct,
        topics: topicPerf,
      });
    }

    const totalMinutes = sessions.reduce((s, sess) => s + sess.durationMin, 0);
    const allQuizScores = quizzes.map(q => q.percentage);
    const avgQuizScore = allQuizScores.length ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length) : 0;
    const formattedRevisions = _revisions.map(r => this.formatRevision(r as unknown as Record<string, unknown>));
    const overdue = formattedRevisions.filter(r => r.status === 'pending' && r.nextRevision && r.nextRevision < new Date()).length;

    const diagnostic = this.buildDiagnostic(subjects, sessions, quizzes, formattedRevisions);

    return {
      subjects,
      diagnostic,
      totalStudyMinutes: totalMinutes,
      totalQuizzes: quizzes.length,
      averageQuizScore: avgQuizScore,
      activeRevisionPlans: formattedRevisions.filter(r => r.status === 'pending').length,
      overdueRevisions: overdue,
    };
  }

  private buildDiagnostic(
    subjects: SubjectPerformance[],
    sessions: { startTime: Date; subject: string }[],
    quizzes: { percentage: number }[],
    revisions: RevisionPlan[],
  ): PerformanceDiagnostic {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
    const recentSessions = sessions.filter(s => new Date(s.startTime) > oneWeekAgo);
    const olderSessions = sessions.filter(s => new Date(s.startTime) <= oneWeekAgo);

    let weeklyTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentSessions.length > olderSessions.length * 1.2) weeklyTrend = 'improving';
    else if (recentSessions.length < olderSessions.length * 0.8) weeklyTrend = 'declining';

    const strengths: { subject: string; detail: string }[] = [];
    const weaknesses: { subject: string; topic: string; detail: string; recommendation: string }[] = [];

    for (const sub of subjects) {
      if (sub.averageQuizScore >= 75) {
        strengths.push({ subject: sub.subject, detail: `Average quiz score: ${sub.averageQuizScore}%, mastery trend: ${sub.trend}` });
      }
      for (const t of sub.topics) {
        if (t.masteryLevel < 40) {
          weaknesses.push({
            subject: sub.subject,
            topic: t.topic,
            detail: `Mastery only ${t.masteryLevel}%`,
            recommendation: `Revise ${t.topic} fundamentals and do practice quizzes`,
          });
        } else if (t.masteryLevel < 60 && t.averageQuizScore < 60) {
          weaknesses.push({
            subject: sub.subject,
            topic: t.topic,
            detail: `Mastery ${t.masteryLevel}%, quiz avg ${t.averageQuizScore}%`,
            recommendation: `Focus on practice problems for ${t.topic}`,
          });
        }
      }
    }

    const revisionUrgency: PerformanceDiagnostic['revisionUrgency'] = [];
    for (const r of revisions.filter(r => r.status === 'pending' && r.nextRevision)) {
      const daysSince = Math.floor((now.getTime() - new Date(r.nextRevision!).getTime()) / 86400000);
      if (daysSince > 0) {
        revisionUrgency.push({
          subject: r.subject,
          topic: r.topic,
          daysSinceStudied: daysSince,
          recommendation: `${r.topic} revision is ${daysSince} days overdue. Review now.`,
        });
      }
    }

    const insights: string[] = [];
    if (sessions.length === 0) insights.push('No study sessions logged yet. Start tracking to get personalized insights.');
    const allQuizAvg = quizzes.length ? quizzes.reduce((a, b) => a + b.percentage, 0) / quizzes.length : 0;
    if (quizzes.length > 0 && allQuizAvg < 60) insights.push('Your quiz scores are below 60%. Try active recall and practice problems instead of passive reading.');
    if (subjects.some(s => s.trend === 'declining')) insights.push('Some subjects show declining trends. Consider redistributing study time.');
    if (subjects.every(s => s.trend === 'improving')) insights.push('Great work! All subjects are showing improvement.');
    if (subjects.length > 0 && subjects.every(s => s.averageQuizScore >= 80)) insights.push('Excellent performance across all subjects. Keep it up!');

    const overallScore = subjects.length ? Math.round(subjects.reduce((s, sub) => s + sub.averageQuizScore, 0) / subjects.length) : 0;
    const summary = subjects.length === 0
      ? 'No performance data yet. Start studying and taking quizzes to see your diagnostic.'
      : `Overall performance score: ${overallScore}/100. ${strengths.length} strengths identified, ${weaknesses.length} areas need attention.`;

    return {
      overallScore,
      summary,
      strengths,
      weaknesses,
      revisionUrgency,
      studyPatternInsights: insights,
      weeklyTrend,
    };
  }

  private calculateNextRevision(revisionCount: number): Date {
    const intervals = [1, 3, 7, 14, 30, 60];
    const days = intervals[Math.min(revisionCount - 1, intervals.length - 1)];
    const next = new Date();
    next.setDate(next.getDate() + days);
    return next;
  }

  private formatQuiz(q: Record<string, unknown>): PracticeQuiz {
    return {
      id: String(q.id),
      userId: String(q.userId),
      subject: String(q.subject),
      topic: String(q.topic),
      title: String(q.title),
      totalMarks: Number(q.totalMarks),
      scoredMarks: Number(q.scoredMarks),
      percentage: Number(q.percentage),
      timeTakenMin: q.timeTakenMin ? Number(q.timeTakenMin) : undefined,
      questions: q.questionsJson ? JSON.parse(String(q.questionsJson)) : [],
      notes: q.notes ? String(q.notes) : undefined,
      studiedAt: new Date(q.studiedAt as Date | string),
      createdAt: new Date(q.createdAt as Date | string),
    };
  }

  private formatRevision(r: Record<string, unknown>): RevisionPlan {
    return {
      id: String(r.id),
      userId: String(r.userId),
      subject: String(r.subject),
      topic: String(r.topic),
      masteryAtCreation: Number(r.masteryAtCreation),
      revisionCount: Number(r.revisionCount),
      nextRevision: r.nextRevision ? new Date(r.nextRevision as Date | string) : undefined,
      status: String(r.status) as RevisionPlan['status'],
      notes: r.notes ? String(r.notes) : undefined,
      createdAt: new Date(r.createdAt as Date | string),
      updatedAt: new Date(r.updatedAt as Date | string),
    };
  }
}

export const performanceIntelligenceService = new PerformanceIntelligenceService();
