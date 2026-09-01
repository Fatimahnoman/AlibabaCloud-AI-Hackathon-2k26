import { createHash } from 'crypto';
import prisma from '@/lib/prisma';

export class ChangeDetector {
  async fetchAndHash(url: string) {
    const start = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeoutId);

      const body = await response.text();
      const durationMs = Date.now() - start;
      const contentPreview = body.substring(0, 1000);
      const hash = createHash('sha256').update(body).digest('hex');

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        hash,
        httpStatus: response.status,
        contentPreview,
        headers,
        durationMs,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      const durationMs = Date.now() - start;
      throw new Error(`Failed to fetch URL: ${error.message || 'Unknown error'} (${durationMs}ms)`);
    }
  }

  hasChanged(oldHash: string | null, newHash: string): boolean {
    if (!oldHash) return true;
    return oldHash !== newHash;
  }

  async getChangeHistory(sourceId: string) {
    const snapshots = await prisma.sourceSnapshot.findMany({
      where: { sourceId },
      orderBy: { capturedAt: 'asc' },
    });

    const history: { date: Date; hash: string; changed: boolean }[] = [];

    for (let i = 0; i < snapshots.length; i++) {
      const snapshot = snapshots[i];
      const prevHash = i > 0 ? snapshots[i - 1].contentHash : null;
      history.push({
        date: snapshot.capturedAt,
        hash: snapshot.contentHash,
        changed: this.hasChanged(prevHash, snapshot.contentHash),
      });
    }

    return history;
  }
}

export const changeDetector = new ChangeDetector();
