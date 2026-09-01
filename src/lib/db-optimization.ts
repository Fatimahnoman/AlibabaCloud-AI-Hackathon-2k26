import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface ConnectionInfo {
  provider: string;
  version: string;
  uptime: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export class DbOptimizer {
  constructor(private readonly client: PrismaClient) {}

  async withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3, delayMs: number = 100): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await sleep(delayMs * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  async measureQuery<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startedAt = performance.now();
    try {
      return await fn();
    } finally {
      const durationMs = Math.round(performance.now() - startedAt);
      console.log(`[db] ${name} completed in ${durationMs}ms`);
    }
  }

  async batchQueries<T>(queries: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(queries.map((query) => query()));
  }

  async getConnectionInfo(): Promise<ConnectionInfo> {
    try {
      const rows = await this.client.$queryRaw<Array<{ version: string }>>`SELECT version() AS version`;
      return {
        provider: 'postgresql',
        version: String(rows[0]?.version ?? 'unknown'),
        uptime: formatUptime(process.uptime()),
      };
    } catch {
      const rows = await this.client.$queryRaw<Array<{ version: string }>>`SELECT sqlite_version() AS version`;
      return {
        provider: 'sqlite',
        version: String(rows[0]?.version ?? 'unknown'),
        uptime: formatUptime(process.uptime()),
      };
    }
  }
}

export const dbOptimizer = new DbOptimizer(prisma);
