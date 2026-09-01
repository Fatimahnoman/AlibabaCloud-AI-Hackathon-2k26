import type { ProactiveInsight, UnifiedStudentProfile } from './types';

export class ProactiveInsights {
  async generateInsights(profile: UnifiedStudentProfile): Promise<ProactiveInsight[]> {
    const insights: ProactiveInsight[] = [];

    if (profile.learning.weakSubjects.length > 0) {
      insights.push({
        id: `weak-subjects-${Date.now()}`,
        type: 'nudge',
        domain: 'study',
        title: 'Weak Areas Detected',
        message: `You have ${profile.learning.weakSubjects.length} weak subject(s): ${profile.learning.weakSubjects.join(', ')}. Consider dedicating extra study time this week.`,
        actionLabel: 'View Study Topics',
        actionUrl: '/study-planner/topics',
        priority: 'high',
        createdAt: new Date(),
      });
    }

    if (profile.learning.totalStudyMinutesThisWeek === 0 && profile.learning.topicsTracked > 0) {
      insights.push({
        id: `no-study-${Date.now()}`,
        type: 'reminder',
        domain: 'study',
        title: 'No Study Sessions This Week',
        message: "You haven't logged any study sessions this week. Even 30 minutes a day helps maintain momentum.",
        actionLabel: 'Start Timer',
        actionUrl: '/study-planner/timer',
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    if (profile.learning.avgMasteryLevel >= 80) {
      insights.push({
        id: `high-mastery-${Date.now()}`,
        type: 'celebration',
        domain: 'study',
        title: 'Great Progress!',
        message: `Your average mastery level is ${profile.learning.avgMasteryLevel}%. Keep up the excellent work!`,
        priority: 'low',
        createdAt: new Date(),
      });
    }

    if (profile.education.applicationChecklists.length > 0) {
      const pending = profile.education.applicationChecklists.filter(a => a.status === 'in_progress');
      if (pending.length > 0) {
        insights.push({
          id: `app-pending-${Date.now()}`,
          type: 'reminder',
          domain: 'application',
          title: 'Pending Applications',
          message: `You have ${pending.length} application(s) in progress. Don't forget to submit required documents.`,
          actionLabel: 'View Checklist',
          actionUrl: '/education',
          priority: 'high',
          createdAt: new Date(),
        });
      }
    }

    if (profile.education.savedUniversities === 0 && profile.education.targetCountry) {
      insights.push({
        id: `no-universities-${Date.now()}`,
        type: 'suggestion',
        domain: 'education',
        title: 'Start University Research',
        message: `You mentioned ${profile.education.targetCountry} as your target country. Start exploring universities and courses.`,
        actionLabel: 'Explore Universities',
        actionUrl: '/education/universities',
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    if (profile.finances.hasProfile && profile.finances.savingsProgress > 0 && profile.finances.savingsProgress < 50) {
      insights.push({
        id: `savings-low-${Date.now()}`,
        type: 'nudge',
        domain: 'budget',
        title: 'Savings Goal Progress',
        message: `You're ${profile.finances.savingsProgress}% towards your savings goal. Consider reviewing your expenses to accelerate progress.`,
        actionLabel: 'View Budget',
        actionUrl: '/budget',
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    if (profile.finances.hasProfile && profile.finances.savingsProgress >= 80) {
      insights.push({
        id: `savings-almost-${Date.now()}`,
        type: 'celebration',
        domain: 'budget',
        title: 'Almost There!',
        message: `You're ${profile.finances.savingsProgress}% towards your savings goal. Great financial discipline!`,
        priority: 'low',
        createdAt: new Date(),
      });
    }

    if (profile.security.unresolvedReports > 0) {
      insights.push({
        id: `unresolved-${Date.now()}`,
        type: 'warning',
        domain: 'security',
        title: 'Unresolved Security Reports',
        message: `You have ${profile.security.unresolvedReports} unresolved security report(s). Review them for potential threats.`,
        actionLabel: 'View Reports',
        actionUrl: '/fraud/history',
        priority: 'high',
        createdAt: new Date(),
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
}

export const proactiveInsights = new ProactiveInsights();
