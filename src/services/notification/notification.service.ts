import prisma from '@/lib/prisma';
import type {
  Deadline,
  Notification,
  NotificationPreference,
  CreateDeadlineInput,
  UpdateDeadlineInput,
  DeadlineNotificationResult,
  NotificationDashboard,
  NotificationType,
  NotificationPriority,
} from '@/types/education-student';

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  return Math.ceil((b.getTime() - a.getTime()) / msPerDay);
}

function getUrgency(daysUntil: number): DeadlineNotificationResult['urgency'] {
  if (daysUntil <= 0) return 'critical';
  if (daysUntil <= 3) return 'critical';
  if (daysUntil <= 7) return 'high';
  if (daysUntil <= 14) return 'medium';
  return 'low';
}

function getNotifPriority(daysUntil: number): NotificationPriority {
  if (daysUntil <= 0) return 'urgent';
  if (daysUntil <= 3) return 'urgent';
  if (daysUntil <= 7) return 'high';
  if (daysUntil <= 14) return 'normal';
  return 'low';
}

function toDeadline(row: any): Deadline {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description ?? undefined,
    deadlineDate: row.deadlineDate,
    deadlineType: row.deadlineType,
    sourceType: row.sourceType ?? undefined,
    sourceId: row.sourceId ?? undefined,
    isVerified: row.isVerified,
    lastVerifiedAt: row.lastVerifiedAt ?? undefined,
    status: row.status,
    reminderDaysBefore: row.reminderDaysBefore,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.userId,
    deadlineId: row.deadlineId ?? undefined,
    title: row.title,
    message: row.message,
    notificationType: row.notificationType,
    priority: row.priority,
    isRead: row.isRead,
    readAt: row.readAt ?? undefined,
    metadataJson: row.metadataJson ?? undefined,
    createdAt: row.createdAt,
  };
}

export class NotificationService {
  async createDeadline(userId: string, input: CreateDeadlineInput): Promise<Deadline> {
    const deadlineDate = new Date(input.deadlineDate);
    const deadline = await prisma.deadline.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        deadlineDate,
        deadlineType: input.deadlineType,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        isVerified: input.isVerified ?? false,
        status: 'upcoming',
        reminderDaysBefore: input.reminderDaysBefore ?? 7,
      },
    });
    return toDeadline(deadline);
  }

  async getDeadlines(userId: string, filters?: { type?: string; status?: string }): Promise<Deadline[]> {
    const where: any = { userId };
    if (filters?.type) where.deadlineType = filters.type;
    if (filters?.status) where.status = filters.status;
    const rows = await prisma.deadline.findMany({
      where,
      orderBy: { deadlineDate: 'asc' },
    });
    return rows.map(toDeadline);
  }

  async getDeadlineById(id: string, userId: string): Promise<Deadline | null> {
    const row = await prisma.deadline.findFirst({ where: { id, userId } });
    return row ? toDeadline(row) : null;
  }

  async updateDeadline(id: string, userId: string, input: UpdateDeadlineInput): Promise<Deadline | null> {
    const existing = await prisma.deadline.findFirst({ where: { id, userId } });
    if (!existing) return null;
    const updated = await prisma.deadline.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.deadlineDate !== undefined && { deadlineDate: new Date(input.deadlineDate) }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.reminderDaysBefore !== undefined && { reminderDaysBefore: input.reminderDaysBefore }),
      },
    });
    return toDeadline(updated);
  }

  async deleteDeadline(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.deadline.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.deadline.delete({ where: { id } });
    return true;
  }

  async getUpcomingDeadlines(userId: string, days: number = 30): Promise<DeadlineNotificationResult[]> {
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 86400000);
    const rows = await prisma.deadline.findMany({
      where: {
        userId,
        deadlineDate: { gte: now, lte: cutoff },
        status: { notIn: ['completed'] },
      },
      orderBy: { deadlineDate: 'asc' },
    });
    return rows.map((r) => ({
      deadlineId: r.id,
      title: r.title,
      deadlineDate: r.deadlineDate,
      daysUntil: daysBetween(now, r.deadlineDate),
      urgency: getUrgency(daysBetween(now, r.deadlineDate)),
    }));
  }

  async checkDeadlinesAndNotify(): Promise<number> {
    const now = new Date();
    let notificationsCreated = 0;

    const allActiveDeadlines = await prisma.deadline.findMany({
      where: {
        status: { notIn: ['completed'] },
        deadlineDate: { gte: new Date(now.getTime() - 7 * 86400000) },
      },
      include: { user: { include: { notificationPreference: true } } },
    });

    for (const deadline of allActiveDeadlines) {
      const prefs = (deadline as any).user?.notificationPreference;
      if (prefs && !prefs.inAppEnabled) continue;

      const typeAllowed = this.isAlertTypeAllowed(deadline.deadlineType, prefs);
      if (!typeAllowed) continue;

      const daysUntil = daysBetween(now, deadline.deadlineDate);
      const notifType = this.getNotificationType(daysUntil);
      if (!notifType) continue;

      const existing = await prisma.notification.findFirst({
        where: {
          deadlineId: deadline.id,
          notificationType: notifType,
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
        },
      });
      if (existing) continue;

      const title = this.buildNotificationTitle(deadline.title, deadline.deadlineType, daysUntil);
      const message = this.buildNotificationMessage(deadline.title, deadline.deadlineType, daysUntil);

      await prisma.notification.create({
        data: {
          userId: deadline.userId,
          deadlineId: deadline.id,
          title,
          message,
          notificationType: notifType,
          priority: getNotifPriority(daysUntil),
        },
      });
      notificationsCreated++;
    }

    await this.updatePassedDeadlines(now);
    return notificationsCreated;
  }

  private isAlertTypeAllowed(type: string, prefs: any): boolean {
    if (!prefs) return true;
    switch (type) {
      case 'scholarship': return prefs.scholarshipAlerts;
      case 'university': return prefs.universityAlerts;
      case 'application': return prefs.applicationAlerts;
      case 'study': return prefs.studyAlerts;
      case 'budget': return prefs.budgetAlerts;
      default: return true;
    }
  }

  private getNotificationType(daysUntil: number): NotificationType | null {
    if (daysUntil < 0) return 'deadline_passed';
    if (daysUntil === 0) return 'deadline_today';
    if (daysUntil <= 7) return 'deadline_approaching';
    return null;
  }

  private buildNotificationTitle(title: string, type: string, daysUntil: number): string {
    if (daysUntil < 0) return `${type.charAt(0).toUpperCase() + type.slice(1)} deadline passed: ${title}`;
    if (daysUntil === 0) return `${type.charAt(0).toUpperCase() + type.slice(1)} deadline today: ${title}`;
    return `${type.charAt(0).toUpperCase() + type.slice(1)} deadline in ${daysUntil} day${daysUntil === 1 ? '' : 's'}: ${title}`;
  }

  private buildNotificationMessage(title: string, type: string, daysUntil: number): string {
    if (daysUntil < 0) return `The ${type} deadline for "${title}" has passed. Please take any necessary follow-up action.`;
    if (daysUntil === 0) return `The ${type} deadline for "${title}" is today. Please submit before end of day.`;
    if (daysUntil === 1) return `The ${type} deadline for "${title}" is tomorrow. Prepare your submission now.`;
    return `The ${type} deadline for "${title}" is in ${daysUntil} days. Start preparing your application.`;
  }

  private async updatePassedDeadlines(now: Date): Promise<void> {
    await prisma.deadline.updateMany({
      where: {
        status: 'upcoming',
        deadlineDate: { lt: now },
      },
      data: { status: 'passed' },
    });
  }

  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    const rows = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map(toNotification);
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.notification.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return true;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    let prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({ data: { userId } });
    }
    return {
      id: prefs.id,
      userId: prefs.userId,
      emailEnabled: prefs.emailEnabled,
      inAppEnabled: prefs.inAppEnabled,
      scholarshipAlerts: prefs.scholarshipAlerts,
      universityAlerts: prefs.universityAlerts,
      applicationAlerts: prefs.applicationAlerts,
      studyAlerts: prefs.studyAlerts,
      budgetAlerts: prefs.budgetAlerts,
      reminderDaysBefore: prefs.reminderDaysBefore,
      createdAt: prefs.createdAt,
      updatedAt: prefs.updatedAt,
    };
  }

  async updatePreferences(userId: string, input: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<NotificationPreference> {
    const existing = await prisma.notificationPreference.findUnique({ where: { userId } });
    if (existing) {
      const updated = await prisma.notificationPreference.update({
        where: { userId },
        data: input,
      });
      return {
        id: updated.id,
        userId: updated.userId,
        emailEnabled: updated.emailEnabled,
        inAppEnabled: updated.inAppEnabled,
        scholarshipAlerts: updated.scholarshipAlerts,
        universityAlerts: updated.universityAlerts,
        applicationAlerts: updated.applicationAlerts,
        studyAlerts: updated.studyAlerts,
        budgetAlerts: updated.budgetAlerts,
        reminderDaysBefore: updated.reminderDaysBefore,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    }
    const created = await prisma.notificationPreference.create({
      data: { userId, ...input },
    });
    return {
      id: created.id,
      userId: created.userId,
      emailEnabled: created.emailEnabled,
      inAppEnabled: created.inAppEnabled,
      scholarshipAlerts: created.scholarshipAlerts,
      universityAlerts: created.universityAlerts,
      applicationAlerts: created.applicationAlerts,
      studyAlerts: created.studyAlerts,
      budgetAlerts: created.budgetAlerts,
      reminderDaysBefore: created.reminderDaysBefore,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async getDashboard(userId: string): Promise<NotificationDashboard> {
    const now = new Date();
    const [deadlines, notifications, unreadCount] = await Promise.all([
      prisma.deadline.findMany({ where: { userId, status: { notIn: ['completed'] } }, orderBy: { deadlineDate: 'asc' } }),
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    const upcomingDeadlines: DeadlineNotificationResult[] = deadlines
      .filter((d) => d.deadlineDate >= now)
      .slice(0, 10)
      .map((d) => ({
        deadlineId: d.id,
        title: d.title,
        deadlineDate: d.deadlineDate,
        daysUntil: daysBetween(now, d.deadlineDate),
        urgency: getUrgency(daysBetween(now, d.deadlineDate)),
      }));

    const upcoming = deadlines.filter((d) => d.status === 'upcoming' && d.deadlineDate >= now).length;
    const urgent = deadlines.filter((d) => {
      const days = daysBetween(now, d.deadlineDate);
      return days >= 0 && days <= 7 && d.status !== 'completed';
    }).length;
    const passed = deadlines.filter((d) => d.status === 'passed').length;
    const completed = deadlines.filter((d) => d.status === 'completed').length;

    return {
      unreadCount,
      upcomingDeadlines,
      recentNotifications: notifications.map(toNotification),
      stats: {
        totalDeadlines: deadlines.length + completed,
        upcoming,
        urgent,
        passed,
        completed,
      },
    };
  }
}

export const notificationService = new NotificationService();
