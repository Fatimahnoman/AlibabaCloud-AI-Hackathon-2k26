import prisma from '@/lib/prisma';
import { privacyEngine } from './privacy-engine';
import { proactiveInsights } from './proactive-insights';
import type { UnifiedStudentProfile, AssistantContext, ProactiveInsight } from './types';

export class StudentAssistantService {
  async buildUnifiedProfile(userId: string): Promise<UnifiedStudentProfile> {
    const [user, profile, learningProfile, studentProfile, budgetProfile, savingsGoals, studyPlans, studySessions, studyTopics, savedCourses, savedUniversities, savedScholarships, checklists, fraudReports, urlScans, memoryEntries] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.learningProfile.findUnique({ where: { userId } }),
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.budgetProfile.findUnique({ where: { userId } }),
      prisma.savingsGoal.findMany({ where: { userId, status: 'active' } }),
      prisma.studyPlan.findMany({ where: { userId, status: 'active' } }),
      prisma.studySession.findMany({ where: { userId }, orderBy: { startTime: 'desc' }, take: 50 }),
      prisma.studyTopic.findMany({ where: { userId } }),
      prisma.savedCourse.findMany({ where: { userId } }),
      prisma.savedUniversity.findMany({ where: { userId } }),
      prisma.savedScholarship.findMany({ where: { userId } }),
      prisma.applicationChecklist.findMany({ where: { userId } }),
      prisma.fraudReport.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.urlScan.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.userMemory.findMany({ where: { userId } }),
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = studySessions.filter(s => new Date(s.startTime) >= weekAgo);
    const totalStudyMinutesThisWeek = weekSessions.reduce((sum, s) => sum + s.durationMin, 0);
    const avgMasteryLevel = studyTopics.length > 0
      ? Math.round(studyTopics.reduce((sum, t) => sum + t.masteryLevel, 0) / studyTopics.length)
      : 0;

    const weakSubjects = learningProfile?.weakSubjects
      ? JSON.parse(learningProfile.weakSubjects)
      : studentProfile?.weakSubjects
        ? JSON.parse(studentProfile.weakSubjects)
        : [];

    const subjects = learningProfile?.subjects
      ? JSON.parse(learningProfile.subjects)
      : [];

    const totalSaved = savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    const totalTarget = savingsGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
    const savingsProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    const recentRiskLevel = fraudReports.length > 0 ? fraudReports[0].riskLevel : undefined;
    const unresolvedReports = fraudReports.filter(r => r.status === 'pending' || r.status === 'analyzing').length;

    const memory: Record<string, string> = {};
    memoryEntries.forEach(m => { memory[m.key] = m.value; });

    const checklistsData = checklists.map(c => {
      const items = c.items ? JSON.parse(c.items) : [];
      return {
        title: c.title,
        status: c.status,
        progress: items.length > 0 ? Math.round(items.filter((i: { completed?: boolean }) => i.completed).length / items.length * 100) : 0,
      };
    });

    return {
      userId,
      identity: {
        name: user.name,
        email: user.email,
        country: user.country || undefined,
        preferredLanguage: user.preferredLanguage,
        educationLevel: learningProfile?.educationLevel || profile?.educationLevel || undefined,
      },
      learning: {
        subjects,
        weakSubjects,
        learningStyle: learningProfile?.learningStyle || undefined,
        studyHoursPerDay: learningProfile?.studyHoursPerDay || undefined,
        targetExam: learningProfile?.targetExam || undefined,
        activePlanCount: studyPlans.length,
        totalStudyMinutesThisWeek,
        topicsTracked: studyTopics.length,
        avgMasteryLevel,
      },
      education: {
        savedCourses: savedCourses.length,
        savedUniversities: savedUniversities.length,
        savedScholarships: savedScholarships.length,
        applicationChecklists: checklistsData,
        targetCountry: undefined,
        targetField: undefined,
      },
      finances: {
        hasProfile: !!budgetProfile,
        monthlyIncome: budgetProfile?.monthlyIncome ? Number(budgetProfile.monthlyIncome) : undefined,
        currency: budgetProfile?.currency || undefined,
        savingsGoal: budgetProfile?.savingsGoal ? Number(budgetProfile.savingsGoal) : undefined,
        activeSavingsGoals: savingsGoals.length,
        totalSaved,
        savingsProgress,
      },
      security: {
        totalScans: fraudReports.length + urlScans.length,
        recentRiskLevel,
        unresolvedReports,
      },
      memory,
    };
  }

  async buildAssistantContext(userId: string, messageText: string): Promise<AssistantContext> {
    const profile = await this.buildUnifiedProfile(userId);
    const { filtered, injectedDomains } = privacyEngine.filterProfile(profile, messageText);
    const contextString = privacyEngine.formatFilteredContext(filtered);
    const insights = await proactiveInsights.generateInsights(profile);
    const privacyFilteredContext = this.appendInsights(contextString, insights);

    return {
      profile,
      insights,
      contextString: privacyEngine.formatFilteredContext(profile as Partial<UnifiedStudentProfile>),
      privacyFilteredContext,
      injectedDomains,
    };
  }

  private appendInsights(context: string, insights: ProactiveInsight[]): string {
    if (insights.length === 0) return context;
    const lines = [context, '', '### Proactive Insights'];
    insights.slice(0, 5).forEach(i => {
      const icon = i.type === 'celebration' ? '🎉' : i.type === 'warning' ? '⚠️' : i.type === 'reminder' ? '⏰' : i.type === 'suggestion' ? '💡' : '👉';
      lines.push(`- ${icon} **${i.title}**: ${i.message}`);
    });
    return lines.join('\n');
  }

  async getDashboardSummary(userId: string) {
    const profile = await this.buildUnifiedProfile(userId);
    const insights = await proactiveInsights.generateInsights(profile);
    return { profile, insights };
  }
}

export const studentAssistantService = new StudentAssistantService();
