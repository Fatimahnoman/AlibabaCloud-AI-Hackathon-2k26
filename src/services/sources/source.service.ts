import prisma from '@/lib/prisma';
import { SourceEntityType, SourceType } from '@/types';

type SourceVerificationStatus = 'verified' | 'needs_review' | 'unverified' | 'expired' | 'pending';

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface RecordSourceData {
  entityType: SourceEntityType;
  entityId: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: SourceType;
}

interface VerifySourceOptions {
  checkedBy?: string;
}

export class SourceService {
  async recordSource(data: RecordSourceData) {
    const existing = await prisma.source.findFirst({
      where: {
        entityType: data.entityType,
        entityId: data.entityId,
        sourceUrl: data.sourceUrl,
      },
    });

    if (existing) {
      return prisma.source.update({
        where: { id: existing.id },
        data: {
          sourceName: data.sourceName,
          sourceType: data.sourceType,
        },
      });
    }

    return prisma.source.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        sourceUrl: data.sourceUrl,
        sourceName: data.sourceName,
        sourceType: data.sourceType,
        verificationStatus: 'pending',
      },
    });
  }

  async getSourceById(id: string, userId: string) {
    return prisma.source.findFirst({ where: { id, userId } });
  }

  async deleteSource(id: string, userId: string) {
    const source = await prisma.source.findFirst({ where: { id, userId } });
    if (!source) return false;
    await prisma.verificationLog.deleteMany({ where: { sourceId: id } });
    await prisma.sourceSnapshot.deleteMany({ where: { sourceId: id } });
    await prisma.source.delete({ where: { id } });
    return true;
  }

  async getSourcesForEntity(entityType: string, entityId: string) {
    return prisma.source.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifySource(sourceId: string, options?: VerifySourceOptions) {
    const source = await prisma.source.findUnique({ where: { id: sourceId } });
    if (!source) throw new Error('Source not found');

    const previousStatus = source.verificationStatus;
    let newStatus: SourceVerificationStatus = 'unverified';
    let httpStatus: number | null = null;
    let result: string | null = null;
    let durationMs = 0;

    try {
      const start = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(source.sourceUrl, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeoutId);
      durationMs = Date.now() - start;

      httpStatus = response.status;

      if (response.ok) {
        newStatus = 'verified';
        result = 'URL returned ' + httpStatus;
      } else if (response.status === 404 || response.status === 410) {
        newStatus = 'expired';
        result = 'URL returned ' + httpStatus;
      } else if (response.status >= 400) {
        const updatedFailureCount = source.failureCount + 1;
        newStatus = updatedFailureCount >= 3 ? 'needs_review' : 'unverified';
        result = 'HTTP error ' + httpStatus;
        await prisma.source.update({
          where: { id: sourceId },
          data: {
            failureCount: updatedFailureCount,
            verificationStatus: newStatus,
            checkCount: { increment: 1 },
          },
        });

        await prisma.verificationLog.create({
          data: {
            sourceId,
            entityType: source.entityType,
            entityId: source.entityId,
            previousStatus,
            newStatus,
            method: 'http_head',
            result,
            httpStatus,
            contentChanged: false,
            details: `Failure count: ${updatedFailureCount}`,
            checkedBy: options?.checkedBy || null,
            durationMs,
          },
        });

        return prisma.source.findUnique({ where: { id: sourceId } });
      }
    } catch (error: any) {
      durationMs = Date.now() - durationMs;
      const updatedFailureCount = source.failureCount + 1;
      newStatus = updatedFailureCount >= 3 ? 'needs_review' : 'unverified';
      result = error.name === 'AbortError' ? 'Request timed out' : error.message || 'Network error';

      await prisma.source.update({
        where: { id: sourceId },
        data: {
          failureCount: updatedFailureCount,
          verificationStatus: newStatus,
          checkCount: { increment: 1 },
        },
      });

      await prisma.verificationLog.create({
        data: {
          sourceId,
          entityType: source.entityType,
          entityId: source.entityId,
          previousStatus,
          newStatus,
          method: 'http_head',
          result,
          httpStatus: null,
          contentChanged: false,
          details: `Failure count: ${updatedFailureCount}`,
          checkedBy: options?.checkedBy || null,
          durationMs,
        },
      });

      return prisma.source.findUnique({ where: { id: sourceId } });
    }

    const updateData: any = {
      verificationStatus: newStatus,
      lastVerifiedAt: new Date(),
      checkCount: { increment: 1 },
      failureCount: 0,
      nextCheckAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    if (newStatus === 'verified') {
      updateData.confidenceScore = Math.min(source.confidenceScore + 10, 100);
    }

    await prisma.source.update({ where: { id: sourceId }, data: updateData });

    await prisma.verificationLog.create({
      data: {
        sourceId,
        entityType: source.entityType,
        entityId: source.entityId,
        previousStatus,
        newStatus,
        method: 'http_head',
        result,
        httpStatus,
        contentChanged: false,
        checkedBy: options?.checkedBy || null,
        durationMs,
      },
    });

    return prisma.source.findUnique({ where: { id: sourceId } });
  }

  async getUnverifiedSources(options?: PaginationOptions & { entityType?: string }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      verificationStatus: { not: 'verified' },
    };

    if (options?.entityType) {
      where.entityType = options.entityType;
    }

    const [sources, total] = await Promise.all([
      prisma.source.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.source.count({ where }),
    ]);

    return { sources, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSourcesByStatus(status: SourceVerificationStatus, options?: PaginationOptions) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where = { verificationStatus: status };

    const [sources, total] = await Promise.all([
      prisma.source.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.source.count({ where }),
    ]);

    return { sources, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSourceStats() {
    const [verified, needsReview, unverified, expired, pending, total] = await Promise.all([
      prisma.source.count({ where: { verificationStatus: 'verified' } }),
      prisma.source.count({ where: { verificationStatus: 'needs_review' } }),
      prisma.source.count({ where: { verificationStatus: 'unverified' } }),
      prisma.source.count({ where: { verificationStatus: 'expired' } }),
      prisma.source.count({ where: { verificationStatus: 'pending' } }),
      prisma.source.count(),
    ]);

    return { verified, needs_review: needsReview, unverified, expired, pending, total };
  }

  async flagSource(sourceId: string, reason: string) {
    const source = await prisma.source.findUnique({ where: { id: sourceId } });
    if (!source) throw new Error('Source not found');

    const previousStatus = source.verificationStatus;

    await prisma.source.update({
      where: { id: sourceId },
      data: {
        verificationStatus: 'needs_review',
        notes: reason,
      },
    });

    await prisma.verificationLog.create({
      data: {
        sourceId,
        entityType: source.entityType,
        entityId: source.entityId,
        previousStatus,
        newStatus: 'needs_review',
        method: 'manual_flag',
        result: reason,
        contentChanged: false,
        details: reason,
      },
    });

    return prisma.source.findUnique({ where: { id: sourceId } });
  }

  async bulkVerify(sourceIds: string[]) {
    const results = await Promise.allSettled(
      sourceIds.map((id) => this.verifySource(id))
    );

    return {
      total: sourceIds.length,
      verified: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
      results: results.map((r, i) => ({
        sourceId: sourceIds[i],
        status: r.status === 'fulfilled' ? 'success' : 'error',
        error: r.status === 'rejected' ? r.reason?.message : undefined,
      })),
    };
  }

  async getVerificationHistory(sourceId: string, options?: PaginationOptions) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.verificationLog.findMany({
        where: { sourceId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.verificationLog.count({ where: { sourceId } }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSourceTimeline(entityType: string, entityId: string) {
    const [logs, snapshots] = await Promise.all([
      prisma.verificationLog.findMany({
        where: { entityType, entityId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sourceSnapshot.findMany({
        where: {
          source: { entityType, entityId },
        },
        orderBy: { capturedAt: 'desc' },
      }),
    ]);

    const events = [
      ...logs.map((l) => ({ type: 'verification' as const, date: l.createdAt, data: l })),
      ...snapshots.map((s) => ({ type: 'snapshot' as const, date: s.capturedAt, data: s })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return events;
  }

  async recordSnapshot(sourceId: string, contentHash: string, httpStatus: number, preview?: string) {
    const snapshot = await prisma.sourceSnapshot.create({
      data: {
        sourceId,
        contentHash,
        httpStatus,
        contentPreview: preview || null,
      },
    });

    await prisma.source.update({
      where: { id: sourceId },
      data: { contentHash },
    });

    return snapshot;
  }

  async getExpiredSources() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return prisma.source.findMany({
      where: {
        OR: [
          {
            lastVerifiedAt: { lt: thirtyDaysAgo },
            verificationStatus: { not: 'expired' },
          },
          { verificationStatus: 'expired' },
        ],
      },
      orderBy: { lastVerifiedAt: 'asc' },
    });
  }
}

export const sourceService = new SourceService();
