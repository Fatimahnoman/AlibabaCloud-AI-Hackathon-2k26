import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const mock = {
    sourceSnapshot: {
      findMany: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
import { ChangeDetector } from '@/services/verification/change-detector';

const mockedPrisma = vi.mocked(prisma);
const detector = new ChangeDetector();

describe('ChangeDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasChanged', () => {
    it('returns true when hashes differ', () => {
      const result = detector.hasChanged('hash-aaa', 'hash-bbb');
      expect(result).toBe(true);
    });

    it('returns true when old hash is null', () => {
      const result = detector.hasChanged(null, 'hash-new');
      expect(result).toBe(true);
    });

    it('returns false when hashes match', () => {
      const result = detector.hasChanged('hash-same', 'hash-same');
      expect(result).toBe(false);
    });

    it('returns true for empty string old hash', () => {
      const result = detector.hasChanged('', 'hash-new');
      expect(result).toBe(true);
    });
  });

  describe('getChangeHistory', () => {
    it('returns timeline with change flags', async () => {
      const snapshots = [
        { contentHash: 'hash-1', capturedAt: new Date('2025-01-01') },
        { contentHash: 'hash-1', capturedAt: new Date('2025-01-02') },
        { contentHash: 'hash-2', capturedAt: new Date('2025-01-03') },
      ];
      mockedPrisma.sourceSnapshot.findMany.mockResolvedValue(snapshots as never);

      const result = await detector.getChangeHistory('src-1');

      expect(result).toHaveLength(3);
      expect(result[0].changed).toBe(true);
      expect(result[1].changed).toBe(false);
      expect(result[2].changed).toBe(true);
    });

    it('returns empty array when no snapshots exist', async () => {
      mockedPrisma.sourceSnapshot.findMany.mockResolvedValue([] as never);

      const result = await detector.getChangeHistory('src-1');

      expect(result).toEqual([]);
    });

    it('returns chronological order', async () => {
      const snapshots = [
        { contentHash: 'hash-1', capturedAt: new Date('2025-01-01') },
        { contentHash: 'hash-2', capturedAt: new Date('2025-01-02') },
      ];
      mockedPrisma.sourceSnapshot.findMany.mockResolvedValue(snapshots as never);

      const result = await detector.getChangeHistory('src-1');

      expect(result[0].date).toEqual(new Date('2025-01-01'));
      expect(result[1].date).toEqual(new Date('2025-01-02'));
    });
  });

  describe('fetchAndHash', () => {
    it('returns hash and metadata on successful fetch', async () => {
      const mockResponse = {
        status: 200,
        text: vi.fn().mockResolvedValue('page content'),
        headers: {
          forEach: (cb: (v: string, k: string) => void) => {
            cb('text/html', 'content-type');
          },
        },
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse as never);

      const result = await detector.fetchAndHash('https://example.com');

      expect(result).toEqual(expect.objectContaining({
        hash: expect.any(String),
        httpStatus: 200,
        contentPreview: 'page content',
        durationMs: expect.any(Number),
      }));
      expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
      vi.restoreAllMocks();
    });

    it('throws on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error') as never);

      await expect(detector.fetchAndHash('https://bad.example.com')).rejects.toThrow('Failed to fetch URL');
      vi.restoreAllMocks();
    });
  });
});
