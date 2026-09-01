import prisma from '@/lib/prisma';

export type ChangeAction = 'CREATE' | 'UPDATE' | 'DELETE';

interface LogChangeParams {
  userId?: string;
  action: ChangeAction;
  entityType: string;
  entityId: string;
  entityName?: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ChangeLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user?: { id: string; email: string; name: string | null } | null;
}

interface ChangeLogFilters {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class AuditTrailService {
  async logChange(params: LogChangeParams): Promise<void> {
    try {
      await prisma.dataChangeLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          entityName: params.entityName || null,
          oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
          newValue: params.newValue ? JSON.stringify(params.newValue) : null,
          reason: params.reason || null,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (error) {
      console.error('Audit trail log failed:', error);
    }
  }

  async getChangeLogs(filters: ChangeLogFilters = {}): Promise<{
    logs: ChangeLogEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.dataChangeLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      prisma.dataChangeLog.count({ where }),
    ]);

    const parsed = logs.map(log => ({
      ...log,
      oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
      newValue: log.newValue ? JSON.parse(log.newValue) : null,
    }));

    return { logs: parsed, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getEntityHistory(entityType: string, entityId: string): Promise<ChangeLogEntry[]> {
    const logs = await prisma.dataChangeLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    return logs.map(log => ({
      ...log,
      oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
      newValue: log.newValue ? JSON.parse(log.newValue) : null,
    }));
  }

  async getRecentChanges(limit: number = 20): Promise<ChangeLogEntry[]> {
    const logs = await prisma.dataChangeLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    return logs.map(log => ({
      ...log,
      oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
      newValue: log.newValue ? JSON.parse(log.newValue) : null,
    }));
  }

  async getStats(): Promise<{
    totalChanges: number;
    changesToday: number;
    changesByAction: { action: string; count: number }[];
    changesByEntity: { entityType: string; count: number }[];
    topEditors: { userId: string; email: string; count: number }[];
  }> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalChanges, changesToday, byAction, byEntity, topEditors] = await Promise.all([
      prisma.dataChangeLog.count(),
      prisma.dataChangeLog.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.dataChangeLog.groupBy({ by: ['action'], _count: true, orderBy: { _count: { action: 'desc' } } }),
      prisma.dataChangeLog.groupBy({ by: ['entityType'], _count: true, orderBy: { _count: { entityType: 'desc' } } }),
      prisma.dataChangeLog.groupBy({
        by: ['userId'],
        _count: true,
        where: { userId: { not: null } },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    const editorIds = topEditors.map(e => e.userId).filter((id): id is string => id !== null);
    const editors = editorIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: editorIds } }, select: { id: true, email: true } })
      : [];
    const editorMap = new Map(editors.map(e => [e.id, e.email]));

    return {
      totalChanges,
      changesToday,
      changesByAction: byAction.map(a => ({ action: a.action, count: a._count })),
      changesByEntity: byEntity.map(e => ({ entityType: e.entityType, count: e._count })),
      topEditors: topEditors.map(e => ({
        userId: e.userId || '',
        email: editorMap.get(e.userId || '') || 'unknown',
        count: e._count,
      })),
    };
  }
}

export const auditTrailService = new AuditTrailService();
