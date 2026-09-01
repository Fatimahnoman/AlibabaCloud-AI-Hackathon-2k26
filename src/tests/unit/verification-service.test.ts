import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const mock = {
    source: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    verificationLog: {
      updateMany: vi.fn(),
      create: vi.fn(),
    },
  };
  return { default: mock };
});

vi.mock('@/services/sources/source.service', () => ({
  sourceService: {
    getSourcesForEntity: vi.fn(),
    verifySource: vi.fn(),
  },
}));

vi.mock('@/services/verification/change-detector', () => ({
  changeDetector: {
    hasChanged: vi.fn(),
  },
}));

import prisma from '@/lib/prisma';
import { VerificationService } from '@/services/verification/verification.service';
import { sourceService } from '@/services/sources/source.service';
import { changeDetector } from '@/services/verification/change-detector';

const mockedPrisma = vi.mocked(prisma);
const mockedSourceService = vi.mocked(sourceService);
const mockedChangeDetector = vi.mocked(changeDetector);
const service = new VerificationService();

describe('VerificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTrustScore', () => {
    it('returns score 0 when no sources exist', async () => {
      mockedPrisma.source.findMany.mockResolvedValue([] as never);

      const result = await service.getTrustScore('university', 'uni-1');

      expect(result).toEqual({ score: 0, status: 'unverified', sourceCount: 0, verifiedCount: 0 });
    });

    it('calculates correct score from mixed sources', async () => {
      const now = new Date();
      const sources = [
        { verificationStatus: 'verified', confidenceScore: 80, lastVerifiedAt: now },
        { verificationStatus: 'verified', confidenceScore: 90, lastVerifiedAt: now },
        { verificationStatus: 'unverified', confidenceScore: 30, lastVerifiedAt: null },
      ];
      mockedPrisma.source.findMany.mockResolvedValue(sources as never);

      const result = await service.getTrustScore('university', 'uni-1');

      expect(result.sourceCount).toBe(3);
      expect(result.verifiedCount).toBe(2);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.status).toMatch(/^(verified|pending|unverified)$/);
    });

    it('returns verified status when score is high', async () => {
      const now = new Date();
      const sources = [
        { verificationStatus: 'verified', confidenceScore: 100, lastVerifiedAt: now },
        { verificationStatus: 'verified', confidenceScore: 100, lastVerifiedAt: now },
      ];
      mockedPrisma.source.findMany.mockResolvedValue(sources as never);

      const result = await service.getTrustScore('university', 'uni-1');

      expect(result.status).toBe('verified');
      expect(result.score).toBeGreaterThanOrEqual(80);
    });
  });

  describe('getEntitiesNeedingReview', () => {
    it('returns entities with high failure counts or expired sources', async () => {
      const sources = [
        { entityType: 'university', entityId: 'uni-1', verificationStatus: 'expired', failureCount: 0, lastVerifiedAt: null },
        { entityType: 'university', entityId: 'uni-2', verificationStatus: 'needs_review', failureCount: 5, lastVerifiedAt: new Date() },
      ];
      mockedPrisma.source.findMany.mockResolvedValue(sources as never);

      const result = await service.getEntitiesNeedingReview();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({ entityType: 'university', reason: 'Source URL expired' }));
      expect(result[1]).toEqual(expect.objectContaining({ entityType: 'university', reason: 'Verification failed 5 times' }));
    });

    it('deduplicates entities from multiple bad sources', async () => {
      const sources = [
        { entityType: 'university', entityId: 'uni-1', verificationStatus: 'expired', failureCount: 0, lastVerifiedAt: null },
        { entityType: 'university', entityId: 'uni-1', verificationStatus: 'needs_review', failureCount: 4, lastVerifiedAt: null },
      ];
      mockedPrisma.source.findMany.mockResolvedValue(sources as never);

      const result = await service.getEntitiesNeedingReview();

      expect(result).toHaveLength(1);
    });

    it('filters by entityType when provided', async () => {
      mockedPrisma.source.findMany.mockResolvedValue([] as never);

      await service.getEntitiesNeedingReview('course');

      expect(mockedPrisma.source.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entityType: 'course' }),
        })
      );
    });
  });

  describe('scheduleNextCheck', () => {
    it('returns 30-day interval for verified sources', async () => {
      const source = { id: 'src-1', verificationStatus: 'verified' };
      mockedPrisma.source.findUnique.mockResolvedValue(source as never);

      const result = await service.scheduleNextCheck('src-1');

      const diffMs = result.getTime() - Date.now();
      expect(diffMs).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
      expect(diffMs).toBeLessThan(31 * 24 * 60 * 60 * 1000);
    });

    it('returns 7-day interval for needs_review sources', async () => {
      const source = { id: 'src-1', verificationStatus: 'needs_review' };
      mockedPrisma.source.findUnique.mockResolvedValue(source as never);

      const result = await service.scheduleNextCheck('src-1');

      const diffMs = result.getTime() - Date.now();
      expect(diffMs).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
      expect(diffMs).toBeLessThan(8 * 24 * 60 * 60 * 1000);
    });

    it('returns 1-day interval for expired sources', async () => {
      const source = { id: 'src-1', verificationStatus: 'expired' };
      mockedPrisma.source.findUnique.mockResolvedValue(source as never);

      const result = await service.scheduleNextCheck('src-1');

      const diffMs = result.getTime() - Date.now();
      expect(diffMs).toBeGreaterThan(0);
      expect(diffMs).toBeLessThan(2 * 24 * 60 * 60 * 1000);
    });
  });
});
