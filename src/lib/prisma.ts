import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaConnected: boolean | undefined;
};

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Eager connection — wakes up Neon free tier database immediately on server start.
  // Without this, the first request blocks while Neon cold-starts (can take 5-10s).
  if (!globalForPrisma.prismaConnected) {
    globalForPrisma.prismaConnected = true;
    (async () => {
      const MAX_WARMUP_RETRIES = 5;
      for (let attempt = 0; attempt < MAX_WARMUP_RETRIES; attempt++) {
        try {
          await client.$connect();
          if (process.env.NODE_ENV === 'development') {
            console.log('[Prisma] Database connected successfully');
          }
          return;
        } catch (error) {
          const isConnError = error instanceof Error && (
            error.message.includes("Can't reach database server") ||
            error.message.includes('P1001') ||
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('ETIMEDOUT')
          );
          if (!isConnError || attempt === MAX_WARMUP_RETRIES - 1) {
            console.error('[Prisma] Database connection failed after retries:', error instanceof Error ? error.message : error);
            return;
          }
          // Wait before retry: 2s, 4s, 8s, 16s
          const delay = 2000 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    })();
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Standalone retry wrapper for async operations that may fail transiently.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (attempt === retries) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retry failed');
}

export default prisma;
