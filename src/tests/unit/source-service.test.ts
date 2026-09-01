import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const mock = {
    source: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    verificationLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
    sourceSnapshot: {
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
import { SourceService } from '@/services/sources/source.service';

const mockedPrisma = vi.mocked(prisma);
const service = new SourceService();

describe('SourceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordSource', () => {
    it('creates a new source when none exists', async () => {
      mockedPrisma.source.findFirst.mockResolvedValue(null as never);
      mockedPrisma.source.create.mockResolvedValue({ id: 'src-1', sourceUrl: 'https://example.com', verificationStatus: 'pending' } as never);

      const result = await service.recordSource({
        entityType: 'university',
        entityId: 'uni-1',
        sourceUrl: 'https://example.com',
        sourceName: 'Example',
        sourceType: 'official_website',
      });

      expect(mockedPrisma.source.create).toHaveBeenCalledOnce();
      expect(result).toEqual(expect.objectContaining({ id: 'src-1' }));
    });

    it('updates an existing source with the same URL', async () => {
      const existing = { id: 'src-1', sourceUrl: 'https://example.com', sourceName: 'Old' };
      mockedPrisma.source.findFirst.mockResolvedValue(existing as never);
      mockedPrisma.source.update.mockResolvedValue({ ...existing, sourceName: 'New' } as never);

      const result = await service.recordSource({
        entityType: 'university',
        entityId: 'uni-1',
        sourceUrl: 'https://example.com',
        sourceName: 'New',
        sourceType: 'official_website',
      });

      expect(mockedPrisma.source.update).toHaveBeenCalledOnce();
      expect(mockedPrisma.source.create).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ sourceName: 'New' }));
    });
  });

  describe('getSourcesForEntity', () => {
    it('returns sources for a given entity', async () => {
      const sources = [{ id: 'src-1' }, { id: 'src-2' }];
      mockedPrisma.source.findMany.mockResolvedValue(sources as never);

      const result = await service.getSourcesForEntity('university', 'uni-1');

      expect(result).toEqual(sources);
      expect(mockedPrisma.source.findMany).toHaveBeenCalledWith({
        where: { entityType: 'university', entityId: 'uni-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('verifySource', () => {
    it('sets status to verified when fetch returns 200', async () => {
      const source = { id: 'src-1', sourceUrl: 'https://example.com', verificationStatus: 'pending', failureCount: 0, confidenceScore: 50, entityType: 'university', entityId: 'uni-1', contentHash: null };
      mockedPrisma.source.findUnique.mockResolvedValue(source as never);
      mockedPrisma.source.update.mockResolvedValue({} as never);
      mockedPrisma.verificationLog.create.mockResolvedValue({} as never);
      mockedPrisma.source.findUnique.mockResolvedValue({ ...source, verificationStatus: 'verified', confidenceScore: 60 } as never);

      global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as never;

      const result = await service.verifySource('src-1');

      expect(result).toEqual(expect.objectContaining({ verificationStatus: 'verified' }));
      expect(mockedPrisma.verificationLog.create).toHaveBeenCalledOnce();
      vi.restoreAllMocks();
    });
  });

  describe('getSourceStats', () => {
    it('returns counts grouped by status', async () => {
      mockedPrisma.source.count
        .mockResolvedValueOnce(10 as never)
        .mockResolvedValueOnce(3 as never)
        .mockResolvedValueOnce(5 as never)
        .mockResolvedValueOnce(2 as never)
        .mockResolvedValueOnce(1 as never)
        .mockResolvedValueOnce(21 as never);

      const result = await service.getSourceStats();

      expect(result).toEqual({ verified: 10, needs_review: 3, unverified: 5, expired: 2, pending: 1, total: 21 });
    });
  });

  describe('flagSource', () => {
    it('sets status to needs_review', async () => {
      const source = { id: 'src-1', verificationStatus: 'verified', entityType: 'university', entityId: 'uni-1' };
      mockedPrisma.source.findUnique.mockResolvedValue(source as never);
      mockedPrisma.source.update.mockResolvedValue({ ...source, verificationStatus: 'needs_review' } as never);
      mockedPrisma.verificationLog.create.mockResolvedValue({} as never);
      mockedPrisma.source.findUnique.mockResolvedValue({ ...source, verificationStatus: 'needs_review', notes: 'Bad data' } as never);

      const result = await service.flagSource('src-1', 'Bad data');

      expect(result).toEqual(expect.objectContaining({ verificationStatus: 'needs_review' }));
      expect(mockedPrisma.verificationLog.create).toHaveBeenCalledOnce();
    });

    it('throws when source not found', async () => {
      mockedPrisma.source.findUnique.mockResolvedValue(null as never);

      await expect(service.flagSource('nonexistent', 'reason')).rejects.toThrow('Source not found');
    });
  });

  describe('getExpiredSources', () => {
    it('returns sources older than 30 days or already expired', async () => {
      const expired = [{ id: 'src-expired' }];
      mockedPrisma.source.findMany.mockResolvedValue(expired as never);

      const result = await service.getExpiredSources();

      expect(result).toEqual(expired);
      expect(mockedPrisma.source.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ lastVerifiedAt: expect.objectContaining({ lt: expect.any(Date) }) }),
            { verificationStatus: 'expired' },
          ]),
        }),
      }));
    });
  });

  describe('getVerificationHistory', () => {
    it('returns paginated logs for a source', async () => {
      const logs = [{ id: 'log-1' }, { id: 'log-2' }];
      mockedPrisma.verificationLog.findMany.mockResolvedValue(logs as never);
      mockedPrisma.verificationLog.count.mockResolvedValue(2 as never);

      const result = await service.getVerificationHistory('src-1');

      expect(result.logs).toEqual(logs);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getSourceTimeline', () => {
    it('returns merged and sorted logs and snapshots', async () => {
      const logs = [{ id: 'log-1', createdAt: new Date('2025-01-02') }];
      const snapshots = [{ id: 'snap-1', capturedAt: new Date('2025-01-03') }];
      mockedPrisma.verificationLog.findMany.mockResolvedValue(logs as never);
      mockedPrisma.sourceSnapshot.findMany.mockResolvedValue(snapshots as never);

      const result = await service.getSourceTimeline('university', 'uni-1');

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('snapshot');
      expect(result[1].type).toBe('verification');
    });
  });
});
