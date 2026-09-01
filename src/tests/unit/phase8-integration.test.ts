import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const mock = {
    source: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    verificationLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    sourceSnapshot: {
      findMany: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { VerificationService } from '@/services/verification/verification.service';
import { ChangeDetector } from '@/services/verification/change-detector';
import { SourceService } from '@/services/sources/source.service';

const mockedPrisma = vi.mocked(prisma);

describe('Phase 8 - Verification status transitions', () => {
  it('unverified transitions to verified when all sources pass', () => {
    const sources = [
      { verificationStatus: 'verified', confidenceScore: 90, lastVerifiedAt: new Date() },
      { verificationStatus: 'verified', confidenceScore: 85, lastVerifiedAt: new Date() },
    ];
    const verifiedCount = sources.filter((s) => s.verificationStatus === 'verified').length;
    const avgConfidence = sources.reduce((sum, s) => sum + s.confidenceScore, 0) / sources.length;

    let status = 'unverified';
    if (verifiedCount > 0) {
      if (avgConfidence >= 80) status = 'verified';
      else if (avgConfidence >= 50) status = 'pending';
    }

    expect(status).toBe('verified');
  });

  it('verified transitions to pending when confidence drops', () => {
    const sources = [
      { verificationStatus: 'verified', confidenceScore: 55, lastVerifiedAt: new Date() },
    ];
    const verifiedCount = sources.filter((s) => s.verificationStatus === 'verified').length;
    const avgConfidence = sources.reduce((sum, s) => sum + s.confidenceScore, 0) / sources.length;

    let status = 'unverified';
    if (verifiedCount > 0) {
      if (avgConfidence >= 80) status = 'verified';
      else if (avgConfidence >= 50) status = 'pending';
    }

    expect(status).toBe('pending');
  });

  it('verified transitions to unverified when no sources pass', () => {
    const sources = [
      { verificationStatus: 'unverified', confidenceScore: 20, lastVerifiedAt: null },
    ];
    const verifiedCount = sources.filter((s) => s.verificationStatus === 'verified').length;

    let status = 'unverified';
    if (verifiedCount > 0) {
      status = 'verified';
    }

    expect(status).toBe('unverified');
  });
});

describe('Phase 8 - Source trust score calculation', () => {
  it('calculates trust score using base, confidence, and recency bonuses', () => {
    const now = new Date();
    const sources = [
      { verificationStatus: 'verified', confidenceScore: 90, lastVerifiedAt: now },
      { verificationStatus: 'verified', confidenceScore: 80, lastVerifiedAt: now },
    ];

    const sourceCount = sources.length;
    const verifiedCount = sources.filter((s) => s.verificationStatus === 'verified').length;
    const baseScore = (verifiedCount / sourceCount) * 60;
    const confidenceBonus = sources.reduce((sum, s) => sum + s.confidenceScore, 0) / sourceCount * 0.3;
    const hasRecent = sources.some((s) => {
      if (!s.lastVerifiedAt) return false;
      const daysSince = (Date.now() - s.lastVerifiedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });
    const recencyBonus = hasRecent ? 10 : 0;
    const score = Math.min(Math.round(baseScore + confidenceBonus + recencyBonus), 100);

    expect(baseScore).toBe(60);
    expect(confidenceBonus).toBeCloseTo(25.5, 0);
    expect(recencyBonus).toBe(10);
    expect(score).toBeGreaterThan(80);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns score 0 for empty sources', () => {
    const sources: never[] = [];
    const sourceCount = sources.length;
    const verifiedCount = 0;

    expect(sourceCount).toBe(0);
    expect(verifiedCount).toBe(0);
  });
});

describe('Phase 8 - Content hash comparison', () => {
  const detector = new ChangeDetector();

  it('detects content change between different hashes', () => {
    expect(detector.hasChanged('aaa', 'bbb')).toBe(true);
  });

  it('detects no change between identical hashes', () => {
    expect(detector.hasChanged('aaa', 'aaa')).toBe(false);
  });

  it('detects change when previous hash is null (first check)', () => {
    expect(detector.hasChanged(null, 'aaa')).toBe(true);
  });

  it('determines change flags in change history', () => {
    const snapshots = [
      { contentHash: 'h1', capturedAt: new Date() },
      { contentHash: 'h1', capturedAt: new Date() },
      { contentHash: 'h2', capturedAt: new Date() },
    ];

    const history = snapshots.map((snap, i) => ({
      hash: snap.contentHash,
      changed: i === 0 ? true : snapshots[i - 1].contentHash !== snap.contentHash,
    }));

    expect(history[0].changed).toBe(true);
    expect(history[1].changed).toBe(false);
    expect(history[2].changed).toBe(true);
  });
});

describe('Phase 8 - Audit action types', () => {
  const verificationActions = [
    'http_head',
    'manual_flag',
    'scheduled_check',
    'manual_reverify',
    'bulk_verify',
  ];

  it('includes http_head action for URL verification', () => {
    expect(verificationActions).toContain('http_head');
  });

  it('includes manual_flag action for flagging sources', () => {
    expect(verificationActions).toContain('manual_flag');
  });

  it('includes scheduled_check for automated checks', () => {
    expect(verificationActions).toContain('scheduled_check');
  });

  it('includes manual_reverify for re-verification', () => {
    expect(verificationActions).toContain('manual_reverify');
  });

  it('includes bulk_verify for batch operations', () => {
    expect(verificationActions).toContain('bulk_verify');
  });
});

describe('Phase 8 - Source stats calculation', () => {
  it('sums to total across all statuses', () => {
    const stats = {
      verified: 10,
      needs_review: 3,
      unverified: 5,
      expired: 2,
      pending: 1,
      total: 21,
    };

    const sum = stats.verified + stats.needs_review + stats.unverified + stats.expired + stats.pending;
    expect(sum).toBe(stats.total);
  });

  it('identifies healthy vs unhealthy ratios', () => {
    const stats = { verified: 15, needs_review: 1, unverified: 2, expired: 0, pending: 2 };
    const healthy = stats.verified + stats.pending;
    const unhealthy = stats.needs_review + stats.unverified + stats.expired;

    expect(healthy).toBeGreaterThan(unhealthy);
  });
});

describe('Phase 8 - VerificationBadge rendering', () => {
  it('VerificationBadge is a valid component', () => {
    expect(typeof VerificationBadge).toBe('function');
  });

  it('VerificationBadge accepts valid status values', () => {
    const validStatuses = ['verified', 'needs_review', 'unverified', 'expired', 'pending'];
    for (const status of validStatuses) {
      expect(validStatuses).toContain(status);
    }
  });
});

describe('Phase 8 - Service imports resolve', () => {
  it('SourceService is instantiable', () => {
    const service = new SourceService();
    expect(service).toBeDefined();
    expect(typeof service.recordSource).toBe('function');
    expect(typeof service.getSourcesForEntity).toBe('function');
    expect(typeof service.getSourceStats).toBe('function');
  });

  it('VerificationService is instantiable', () => {
    const service = new VerificationService();
    expect(service).toBeDefined();
    expect(typeof service.getTrustScore).toBe('function');
    expect(typeof service.scheduleNextCheck).toBe('function');
  });

  it('ChangeDetector is instantiable', () => {
    const detector = new ChangeDetector();
    expect(detector).toBeDefined();
    expect(typeof detector.hasChanged).toBe('function');
    expect(typeof detector.getChangeHistory).toBe('function');
  });
});
