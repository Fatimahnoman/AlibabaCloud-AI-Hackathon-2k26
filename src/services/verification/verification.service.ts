import prisma from '@/lib/prisma';
import { sourceService } from '@/services/sources/source.service';
import { changeDetector } from './change-detector';

export class VerificationService {
  async verifyEntity(entityType: string, entityId: string) {
    const sources = await sourceService.getSourcesForEntity(entityType, entityId);
    const changes: string[] = [];
    let sourcesChecked = 0;

    for (const source of sources) {
      sourcesChecked++;
      const oldHash = source.contentHash;

      const verifiedSource = await sourceService.verifySource(source.id);

      if (verifiedSource && oldHash && verifiedSource.contentHash) {
        if (changeDetector.hasChanged(oldHash, verifiedSource.contentHash)) {
          changes.push(`Content changed for source ${source.id}`);
          await prisma.verificationLog.updateMany({
            where: {
              sourceId: source.id,
              entityType,
              entityId,
            },
            data: { contentChanged: true },
          });
        }
      }
    }

    const verifiedSources = await prisma.source.findMany({
      where: { entityType, entityId, verificationStatus: 'verified' },
    });

    let status = 'unverified';
    if (verifiedSources.length > 0) {
      const totalConfidence = verifiedSources.reduce((sum, s) => sum + s.confidenceScore, 0);
      const avgConfidence = totalConfidence / verifiedSources.length;
      if (avgConfidence >= 80) status = 'verified';
      else if (avgConfidence >= 50) status = 'pending';
      else status = 'unverified';
    }

    return { status, sourcesChecked, changes };
  }

  async runScheduledVerification() {
    const now = new Date();
    const sources = await prisma.source.findMany({
      where: {
        OR: [
          { nextCheckAt: null },
          { nextCheckAt: { lte: now } },
        ],
      },
    });

    let verified = 0;
    let failed = 0;
    let changed = 0;

    for (const source of sources) {
      try {
        const oldHash = source.contentHash;
        const result = await sourceService.verifySource(source.id);

        if (result) {
          if (result.verificationStatus === 'verified') {
            verified++;
          } else if (result.verificationStatus === 'needs_review' || result.verificationStatus === 'expired') {
            failed++;
          }

          if (oldHash && result.contentHash && changeDetector.hasChanged(oldHash, result.contentHash)) {
            changed++;
          }
        }
      } catch {
        failed++;
      }

      const nextCheck = await this.scheduleNextCheck(source.id);
      await prisma.source.update({
        where: { id: source.id },
        data: { nextCheckAt: nextCheck },
      });
    }

    return { totalChecked: sources.length, verified, failed, changed };
  }

  async getTrustScore(entityType: string, entityId: string) {
    const sources = await prisma.source.findMany({
      where: { entityType, entityId },
    });

    const sourceCount = sources.length;
    const verifiedCount = sources.filter((s) => s.verificationStatus === 'verified').length;

    if (sourceCount === 0) {
      return { score: 0, status: 'unverified', sourceCount: 0, verifiedCount: 0 };
    }

    const baseScore = (verifiedCount / sourceCount) * 60;
    const confidenceBonus = sources.reduce((sum, s) => sum + s.confidenceScore, 0) / sourceCount * 0.3;
    const recencyBonus = sources.some((s) => {
      if (!s.lastVerifiedAt) return false;
      const daysSince = (Date.now() - s.lastVerifiedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }) ? 10 : 0;

    const score = Math.min(Math.round(baseScore + confidenceBonus + recencyBonus), 100);

    let status: string;
    if (score >= 80) status = 'verified';
    else if (score >= 50) status = 'pending';
    else status = 'unverified';

    const lastVerified = sources
      .filter((s) => s.lastVerifiedAt)
      .sort((a, b) => (b.lastVerifiedAt?.getTime() || 0) - (a.lastVerifiedAt?.getTime() || 0))[0];

    return {
      score,
      status,
      lastChecked: lastVerified?.lastVerifiedAt || undefined,
      sourceCount,
      verifiedCount,
    };
  }

  async getEntitiesNeedingReview(entityType?: string) {
    const where: any = {
      OR: [
        { failureCount: { gte: 3 } },
        { verificationStatus: 'expired' },
      ],
    };

    if (entityType) {
      where.entityType = entityType;
    }

    const sources = await prisma.source.findMany({ where });

    const entityMap = new Map<string, { entityType: string; entityId: string; reason: string; lastVerified?: Date }>();

    for (const source of sources) {
      const key = `${source.entityType}:${source.entityId}`;
      if (!entityMap.has(key)) {
        let reason = '';
        if (source.verificationStatus === 'expired') {
          reason = 'Source URL expired';
        } else if (source.failureCount >= 3) {
          reason = `Verification failed ${source.failureCount} times`;
        }

        entityMap.set(key, {
          entityType: source.entityType,
          entityId: source.entityId,
          reason,
          lastVerified: source.lastVerifiedAt || undefined,
        });
      }
    }

    return Array.from(entityMap.values());
  }

  async scheduleNextCheck(sourceId: string): Promise<Date> {
    const source = await prisma.source.findUnique({ where: { id: sourceId } });
    if (!source) throw new Error('Source not found');

    const now = Date.now();
    let intervalMs: number;

    switch (source.verificationStatus) {
      case 'verified':
        intervalMs = 30 * 24 * 60 * 60 * 1000;
        break;
      case 'needs_review':
        intervalMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'expired':
        intervalMs = 24 * 60 * 60 * 1000;
        break;
      default:
        intervalMs = 24 * 60 * 60 * 1000;
    }

    return new Date(now + intervalMs);
  }
}

export const verificationService = new VerificationService();
