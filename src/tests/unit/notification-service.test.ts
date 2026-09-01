import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  deadline: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), count: vi.fn() },
  notification: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
  notificationPreference: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({ default: mockPrisma }));

import { NotificationService } from '@/services/notification/notification.service';

const mockedPrisma = vi.mocked(mockPrisma);

const service = new NotificationService();
const TEST_USER = 'user-1';
const FIXED_NOW = new Date('2026-06-15T10:00:00');

const mockDeadlineRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'dl-1',
  userId: TEST_USER,
  title: 'Scholarship Application',
  description: 'Submit essay and transcripts',
  deadlineDate: new Date('2026-06-20T10:00:00'),
  deadlineType: 'scholarship',
  sourceType: 'manual',
  sourceId: null,
  isVerified: true,
  lastVerifiedAt: new Date('2026-06-01T09:00:00'),
  status: 'upcoming',
  reminderDaysBefore: 7,
  createdAt: new Date('2026-01-01T08:00:00'),
  updatedAt: new Date('2026-01-01T08:00:00'),
  ...overrides,
});

const mockNotificationRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'notif-1',
  userId: TEST_USER,
  deadlineId: 'dl-1',
  title: 'Deadline approaching',
  message: 'A deadline is approaching',
  notificationType: 'deadline_approaching',
  priority: 'high',
  isRead: false,
  readAt: null,
  metadataJson: null,
  createdAt: new Date('2026-06-14T08:00:00'),
  ...overrides,
});

const mockPreference = (overrides: Record<string, unknown> = {}) => ({
  id: 'pref-1',
  userId: TEST_USER,
  emailEnabled: true,
  inAppEnabled: true,
  scholarshipAlerts: true,
  universityAlerts: true,
  applicationAlerts: true,
  studyAlerts: true,
  budgetAlerts: true,
  reminderDaysBefore: 7,
  createdAt: new Date('2026-01-01T08:00:00'),
  updatedAt: new Date('2026-01-01T08:00:00'),
  ...overrides,
});

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createDeadline', () => {
    it('creates deadline with correct fields', async () => {
      mockedPrisma.deadline.create.mockResolvedValue(mockDeadlineRow() as never);

      const result = await service.createDeadline(TEST_USER, {
        title: 'Scholarship Application',
        description: 'Submit essay and transcripts',
        deadlineDate: new Date('2026-06-20T10:00:00'),
        deadlineType: 'scholarship',
        sourceType: 'manual',
        sourceId: 'src-1',
        isVerified: true,
        reminderDaysBefore: 3,
      });

      expect(result.id).toBe('dl-1');
      expect(result.userId).toBe(TEST_USER);
      expect(result.title).toBe('Scholarship Application');
      expect(result.deadlineType).toBe('scholarship');
      expect(result.deadlineDate).toEqual(new Date('2026-06-20T10:00:00'));
      expect(mockedPrisma.deadline.create).toHaveBeenCalledWith({
        data: {
          userId: TEST_USER,
          title: 'Scholarship Application',
          description: 'Submit essay and transcripts',
          deadlineDate: new Date('2026-06-20T10:00:00'),
          deadlineType: 'scholarship',
          sourceType: 'manual',
          sourceId: 'src-1',
          isVerified: true,
          status: 'upcoming',
          reminderDaysBefore: 3,
        },
      });
    });

    it('sets status to upcoming by default', async () => {
      mockedPrisma.deadline.create.mockResolvedValue(
        mockDeadlineRow({ isVerified: false, reminderDaysBefore: 7 }) as never
      );

      await service.createDeadline(TEST_USER, {
        title: 'Study Exam',
        deadlineDate: new Date('2026-06-25T09:00:00'),
        deadlineType: 'study',
      });

      expect(mockedPrisma.deadline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: TEST_USER,
          title: 'Study Exam',
          isVerified: false,
          status: 'upcoming',
          reminderDaysBefore: 7,
        }),
      });
    });
  });

  describe('getDeadlines', () => {
    it('returns all deadlines for user', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([
        mockDeadlineRow(),
        mockDeadlineRow({ id: 'dl-2', title: 'University App', deadlineType: 'university' }),
      ] as never);

      const result = await service.getDeadlines(TEST_USER);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Scholarship Application');
      expect(result[1].deadlineType).toBe('university');
      expect(mockedPrisma.deadline.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER },
        orderBy: { deadlineDate: 'asc' },
      });
    });

    it('filters by type when provided', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([]);

      await service.getDeadlines(TEST_USER, { type: 'scholarship' });

      expect(mockedPrisma.deadline.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER, deadlineType: 'scholarship' },
        orderBy: { deadlineDate: 'asc' },
      });
    });

    it('filters by status when provided', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([]);

      await service.getDeadlines(TEST_USER, { status: 'upcoming' });

      expect(mockedPrisma.deadline.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER, status: 'upcoming' },
        orderBy: { deadlineDate: 'asc' },
      });
    });

    it('returns empty array for user with no deadlines', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([] as never);

      const result = await service.getDeadlines(TEST_USER);

      expect(result).toEqual([]);
    });
  });

  describe('getDeadlineById', () => {
    it('returns deadline by id and userId', async () => {
      mockedPrisma.deadline.findFirst.mockResolvedValue(mockDeadlineRow() as never);

      const result = await service.getDeadlineById('dl-1', TEST_USER);

      expect(result).not.toBeNull();
      expect(result!.id).toBe('dl-1');
      expect(result!.userId).toBe(TEST_USER);
      expect(result!.title).toBe('Scholarship Application');
      expect(mockedPrisma.deadline.findFirst).toHaveBeenCalledWith({
        where: { id: 'dl-1', userId: TEST_USER },
      });
    });

    it('returns null when not found', async () => {
      mockedPrisma.deadline.findFirst.mockResolvedValue(null);

      const result = await service.getDeadlineById('dl-404', TEST_USER);

      expect(result).toBeNull();
    });
  });

  describe('updateDeadline', () => {
    it('updates deadline fields', async () => {
      mockedPrisma.deadline.findFirst.mockResolvedValue(mockDeadlineRow() as never);
      mockedPrisma.deadline.update.mockResolvedValue(
        mockDeadlineRow({
          title: 'Updated Title',
          status: 'completed',
          reminderDaysBefore: 3,
          deadlineDate: new Date('2026-06-30T10:00:00'),
        }) as never
      );

      const result = await service.updateDeadline('dl-1', TEST_USER, {
        title: 'Updated Title',
        deadlineDate: new Date('2026-06-30T10:00:00'),
        status: 'completed',
        reminderDaysBefore: 3,
      });

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Updated Title');
      expect(result!.status).toBe('completed');
      expect(mockedPrisma.deadline.update).toHaveBeenCalledWith({
        where: { id: 'dl-1' },
        data: {
          title: 'Updated Title',
          deadlineDate: new Date('2026-06-30T10:00:00'),
          status: 'completed',
          reminderDaysBefore: 3,
        },
      });
    });

    it('returns null when deadline not found', async () => {
      mockedPrisma.deadline.findFirst.mockResolvedValue(null);

      const result = await service.updateDeadline('dl-404', TEST_USER, { title: 'Nope' });

      expect(result).toBeNull();
      expect(mockedPrisma.deadline.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteDeadline', () => {
    it('deletes deadline and returns true', async () => {
      mockedPrisma.deadline.findFirst.mockResolvedValue(mockDeadlineRow() as never);
      mockedPrisma.deadline.delete.mockResolvedValue(mockDeadlineRow() as never);

      const result = await service.deleteDeadline('dl-1', TEST_USER);

      expect(result).toBe(true);
      expect(mockedPrisma.deadline.delete).toHaveBeenCalledWith({ where: { id: 'dl-1' } });
    });

    it('returns false when not found', async () => {
      mockedPrisma.deadline.findFirst.mockResolvedValue(null);

      const result = await service.deleteDeadline('dl-404', TEST_USER);

      expect(result).toBe(false);
      expect(mockedPrisma.deadline.delete).not.toHaveBeenCalled();
    });
  });

  describe('getUpcomingDeadlines', () => {
    it('returns deadlines within date range', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([
        mockDeadlineRow({ id: 'dl-near', deadlineDate: new Date('2026-06-17T10:00:00') }),
        mockDeadlineRow({
          id: 'dl-far',
          title: 'University App',
          deadlineType: 'university',
          deadlineDate: new Date('2026-06-22T10:00:00'),
        }),
      ] as never);

      const result = await service.getUpcomingDeadlines(TEST_USER);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        deadlineId: 'dl-near',
        title: 'Scholarship Application',
        deadlineDate: new Date('2026-06-17T10:00:00'),
        daysUntil: 2,
        urgency: 'critical',
      });
      expect(result[1].daysUntil).toBe(7);
      expect(result[1].urgency).toBe('high');
      expect(mockedPrisma.deadline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: TEST_USER,
            deadlineDate: { gte: FIXED_NOW, lte: new Date(FIXED_NOW.getTime() + 30 * 86400000) },
            status: { notIn: ['completed'] },
          },
          orderBy: { deadlineDate: 'asc' },
        })
      );
    });

    it('returns empty when no upcoming deadlines', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([] as never);

      const result = await service.getUpcomingDeadlines(TEST_USER);

      expect(result).toEqual([]);
    });
  });

  describe('checkDeadlinesAndNotify', () => {
    const scanRow = (overrides: Record<string, unknown> = {}) =>
      mockDeadlineRow({
        user: { notificationPreference: mockPreference() },
        ...overrides,
      });

    it('creates notification for approaching deadline', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([
        scanRow({ deadlineDate: new Date('2026-06-18T10:00:00') }),
      ] as never);
      mockedPrisma.notification.findFirst.mockResolvedValue(null);
      mockedPrisma.notification.create.mockResolvedValue(mockNotificationRow() as never);

      const result = await service.checkDeadlinesAndNotify();

      expect(result).toBe(1);
      expect(mockedPrisma.notification.create).toHaveBeenCalledTimes(1);
      expect(mockedPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: TEST_USER,
          deadlineId: 'dl-1',
          title: 'Scholarship deadline in 3 days: Scholarship Application',
          message:
            'The scholarship deadline for "Scholarship Application" is in 3 days. Start preparing your application.',
          notificationType: 'deadline_approaching',
          priority: 'urgent',
        },
      });
    });

    it('creates notification for today deadline', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([
        scanRow({ deadlineDate: new Date('2026-06-15T08:00:00') }),
      ] as never);
      mockedPrisma.notification.findFirst.mockResolvedValue(null);
      mockedPrisma.notification.create.mockResolvedValue(mockNotificationRow() as never);

      const result = await service.checkDeadlinesAndNotify();

      expect(result).toBe(1);
      expect(mockedPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: TEST_USER,
          deadlineId: 'dl-1',
          title: 'Scholarship deadline today: Scholarship Application',
          message:
            'The scholarship deadline for "Scholarship Application" is today. Please submit before end of day.',
          notificationType: 'deadline_today',
          priority: 'urgent',
        }),
      });
    });

    it('creates notification for passed deadline', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([
        scanRow({ deadlineDate: new Date('2026-06-13T10:00:00'), status: 'passed' }),
      ] as never);
      mockedPrisma.notification.findFirst.mockResolvedValue(null);
      mockedPrisma.notification.create.mockResolvedValue(mockNotificationRow() as never);

      const result = await service.checkDeadlinesAndNotify();

      expect(result).toBe(1);
      expect(mockedPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: TEST_USER,
          deadlineId: 'dl-1',
          title: 'Scholarship deadline passed: Scholarship Application',
          message:
            'The scholarship deadline for "Scholarship Application" has passed. Please take any necessary follow-up action.',
          notificationType: 'deadline_passed',
          priority: 'urgent',
        }),
      });
    });

    it('skips duplicate notifications for same day', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([
        scanRow({ deadlineDate: new Date('2026-06-18T10:00:00') }),
      ] as never);
      mockedPrisma.notification.findFirst.mockResolvedValue(
        mockNotificationRow({ createdAt: new Date('2026-06-15T07:00:00') }) as never
      );

      const result = await service.checkDeadlinesAndNotify();

      expect(result).toBe(0);
      expect(mockedPrisma.notification.create).not.toHaveBeenCalled();
      expect(mockedPrisma.notification.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deadlineId: 'dl-1',
            notificationType: 'deadline_approaching',
            createdAt: { gte: new Date(2026, 5, 15) },
          }),
        })
      );
    });

    it('skips deadlines when user preference disables that alert type', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([
        scanRow({
          user: { notificationPreference: mockPreference({ scholarshipAlerts: false }) },
        }),
      ] as never);

      const result = await service.checkDeadlinesAndNotify();

      expect(result).toBe(0);
      expect(mockedPrisma.notification.findFirst).not.toHaveBeenCalled();
      expect(mockedPrisma.notification.create).not.toHaveBeenCalled();
    });

    it('updates passed deadlines status', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([] as never);

      await service.checkDeadlinesAndNotify();

      expect(mockedPrisma.deadline.updateMany).toHaveBeenCalledWith({
        where: {
          status: 'upcoming',
          deadlineDate: { lt: FIXED_NOW },
        },
        data: { status: 'passed' },
      });
    });

    it('returns count of created notifications', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([
        scanRow({ id: 'dl-a', deadlineDate: new Date('2026-06-18T10:00:00') }),
        scanRow({ id: 'dl-b', title: 'Budget Review', deadlineType: 'budget', deadlineDate: new Date('2026-06-15T08:00:00') }),
      ] as never);
      mockedPrisma.notification.findFirst.mockResolvedValue(null);
      mockedPrisma.notification.create.mockResolvedValue(mockNotificationRow() as never);

      const result = await service.checkDeadlinesAndNotify();

      expect(result).toBe(2);
      expect(mockedPrisma.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('getNotifications', () => {
    it('returns notifications for user', async () => {
      mockedPrisma.notification.findMany.mockResolvedValue([
        mockNotificationRow(),
        mockNotificationRow({
          id: 'notif-2',
          title: 'Deadline today',
          notificationType: 'deadline_today',
          priority: 'urgent',
          deadlineId: null,
        }),
      ] as never);

      const result = await service.getNotifications(TEST_USER);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('notif-1');
      expect(result[0].isRead).toBe(false);
      expect(result[1].notificationType).toBe('deadline_today');
      expect(result[1].deadlineId).toBeUndefined();
      expect(mockedPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('returns only unread when unreadOnly is true', async () => {
      mockedPrisma.notification.findMany.mockResolvedValue([
        mockNotificationRow(),
      ] as never);

      const result = await service.getNotifications(TEST_USER, true);

      expect(result).toHaveLength(1);
      expect(mockedPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      mockedPrisma.notification.findFirst.mockResolvedValue(mockNotificationRow() as never);
      mockedPrisma.notification.update.mockResolvedValue(
        mockNotificationRow({ isRead: true, readAt: new Date('2026-06-15T10:00:00') }) as never
      );

      const result = await service.markAsRead('notif-1', TEST_USER);

      expect(result).toBe(true);
      expect(mockedPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });

    it('returns false when not found', async () => {
      mockedPrisma.notification.findFirst.mockResolvedValue(null);

      const result = await service.markAsRead('notif-404', TEST_USER);

      expect(result).toBe(false);
      expect(mockedPrisma.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('marks all unread notifications as read and returns count', async () => {
      mockedPrisma.notification.updateMany.mockResolvedValue({ count: 4 } as never);

      const result = await service.markAllAsRead(TEST_USER);

      expect(result).toBe(4);
      expect(mockedPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER, isRead: false },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('returns correct count', async () => {
      mockedPrisma.notification.count.mockResolvedValue(9);

      const result = await service.getUnreadCount(TEST_USER);

      expect(result).toBe(9);
      expect(mockedPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: TEST_USER, isRead: false },
      });
    });
  });

  describe('getPreferences', () => {
    it('returns existing preferences', async () => {
      mockedPrisma.notificationPreference.findUnique.mockResolvedValue(
        mockPreference({ budgetAlerts: false, reminderDaysBefore: 3 }) as never
      );

      const result = await service.getPreferences(TEST_USER);

      expect(result.id).toBe('pref-1');
      expect(result.userId).toBe(TEST_USER);
      expect(result.inAppEnabled).toBe(true);
      expect(result.budgetAlerts).toBe(false);
      expect(result.reminderDaysBefore).toBe(3);
      expect(mockedPrisma.notificationPreference.findUnique).toHaveBeenCalledWith({
        where: { userId: TEST_USER },
      });
      expect(mockedPrisma.notificationPreference.create).not.toHaveBeenCalled();
    });

    it('creates default preferences when none exist', async () => {
      mockedPrisma.notificationPreference.findUnique.mockResolvedValue(null);
      mockedPrisma.notificationPreference.create.mockResolvedValue(mockPreference() as never);

      const result = await service.getPreferences(TEST_USER);

      expect(result.id).toBe('pref-1');
      expect(result.emailEnabled).toBe(true);
      expect(mockedPrisma.notificationPreference.create).toHaveBeenCalledWith({
        data: { userId: TEST_USER },
      });
    });
  });

  describe('updatePreferences', () => {
    it('updates existing preferences', async () => {
      mockedPrisma.notificationPreference.findUnique.mockResolvedValue(mockPreference() as never);
      mockedPrisma.notificationPreference.update.mockResolvedValue(
        mockPreference({ emailEnabled: false, universityAlerts: false }) as never
      );

      const result = await service.updatePreferences(TEST_USER, {
        emailEnabled: false,
        universityAlerts: false,
      });

      expect(result.emailEnabled).toBe(false);
      expect(result.universityAlerts).toBe(false);
      expect(mockedPrisma.notificationPreference.update).toHaveBeenCalledWith({
        where: { userId: TEST_USER },
        data: { emailEnabled: false, universityAlerts: false },
      });
      expect(mockedPrisma.notificationPreference.create).not.toHaveBeenCalled();
    });

    it('creates new preferences when none exist', async () => {
      mockedPrisma.notificationPreference.findUnique.mockResolvedValue(null);
      mockedPrisma.notificationPreference.create.mockResolvedValue(
        mockPreference({ studyAlerts: false }) as never
      );

      const result = await service.updatePreferences(TEST_USER, { studyAlerts: false });

      expect(result.studyAlerts).toBe(false);
      expect(mockedPrisma.notificationPreference.create).toHaveBeenCalledWith({
        data: { userId: TEST_USER, studyAlerts: false },
      });
      expect(mockedPrisma.notificationPreference.update).not.toHaveBeenCalled();
    });
  });

  describe('getDashboard', () => {
    it('returns dashboard with all stats', async () => {
      mockedPrisma.deadline.findMany.mockResolvedValue([
        mockDeadlineRow({ id: 'dl-urgent', deadlineDate: new Date('2026-06-16T10:00:00') }),
        mockDeadlineRow({
          id: 'dl-later',
          title: 'University App',
          deadlineType: 'university',
          deadlineDate: new Date('2026-07-01T10:00:00'),
        }),
        mockDeadlineRow({ id: 'dl-past', deadlineDate: new Date('2026-06-10T10:00:00'), status: 'passed' }),
      ] as never);
      mockedPrisma.notification.findMany.mockResolvedValue([
        mockNotificationRow(),
        mockNotificationRow({
          id: 'notif-2',
          title: 'Older notification',
          isRead: true,
          readAt: new Date('2026-06-14T12:00:00'),
        }),
      ] as never);
      mockedPrisma.notification.count.mockResolvedValue(5);

      const result = await service.getDashboard(TEST_USER);

      expect(result.unreadCount).toBe(5);
      expect(result.upcomingDeadlines).toHaveLength(2);
      expect(result.upcomingDeadlines[0]).toEqual({
        deadlineId: 'dl-urgent',
        title: 'Scholarship Application',
        deadlineDate: new Date('2026-06-16T10:00:00'),
        daysUntil: 1,
        urgency: 'critical',
      });
      expect(result.upcomingDeadlines[1].daysUntil).toBe(16);
      expect(result.upcomingDeadlines[1].urgency).toBe('low');
      expect(result.recentNotifications).toHaveLength(2);
      expect(result.recentNotifications[0].id).toBe('notif-1');
      expect(result.recentNotifications[1].isRead).toBe(true);
      expect(result.stats).toEqual({
        totalDeadlines: 3,
        upcoming: 2,
        urgent: 1,
        passed: 1,
        completed: 0,
      });
      expect(mockedPrisma.deadline.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER, status: { notIn: ['completed'] } },
        orderBy: { deadlineDate: 'asc' },
      });
      expect(mockedPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      expect(mockedPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: TEST_USER, isRead: false },
      });
    });
  });
});
