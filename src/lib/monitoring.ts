import { prisma } from '@/lib/prisma';

class RingBuffer<T> {
  private items: T[] = [];

  constructor(private readonly capacity: number) {}

  push(item: T): void {
    this.items.push(item);
    if (this.items.length > this.capacity) {
      this.items.splice(0, this.items.length - this.capacity);
    }
  }

  toArray(): T[] {
    return [...this.items];
  }

  get size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}

export interface CapturedError {
  name: string;
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  timestamp: number;
}

export interface ErrorStats {
  total: number;
  last24h: number;
  byType: Record<string, number>;
}

export interface DatabaseCheck {
  status: 'ok' | 'error';
  latencyMs: number;
  error?: string;
}

export interface MemoryCheck {
  status: 'ok' | 'warn';
  heapUsedMB: number;
  heapTotalMB: number;
  rssUsedMB: number;
  percentUsed: number;
}

export interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, DatabaseCheck | MemoryCheck>;
  uptime: number;
}

interface RequestEntry {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

interface AiEntry {
  model: string;
  durationMs: number;
  success: boolean;
  timestamp: number;
}

export interface RequestMetrics {
  total: number;
  avgDurationMs: number;
  errorRate: number;
  byStatus: Record<string, number>;
}

export interface AiMetrics {
  total: number;
  avgDurationMs: number;
  successRate: number;
}

export interface MetricsSnapshot {
  requests: RequestMetrics;
  ai: AiMetrics;
  uptime: number;
}

const ERROR_BUFFER_SIZE = 1000;
const METRICS_BUFFER_SIZE = 10000;
const MEMORY_WARN_PERCENT = 85;

function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export class ErrorTracker {
  private buffer = new RingBuffer<CapturedError>(ERROR_BUFFER_SIZE);
  private totalCount = 0;

  capture(error: Error, context: Record<string, unknown> = {}): void {
    this.buffer.push({
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    });
    this.totalCount++;
  }

  getRecent(limit: number = 50): CapturedError[] {
    const all = this.buffer.toArray();
    return all.slice(-limit).reverse();
  }

  getStats(): ErrorStats {
    const entries = this.buffer.toArray();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const byType: Record<string, number> = {};
    let last24h = 0;

    for (const entry of entries) {
      byType[entry.name] = (byType[entry.name] ?? 0) + 1;
      if (entry.timestamp >= cutoff) last24h++;
    }

    return { total: this.totalCount, last24h, byType };
  }

  clear(): void {
    this.buffer.clear();
    this.totalCount = 0;
  }
}

export class HealthChecker {
  async checkDatabase(): Promise<DatabaseCheck> {
    const startedAt = performance.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', latencyMs: round(performance.now() - startedAt) };
    } catch (error) {
      return {
        status: 'error',
        latencyMs: round(performance.now() - startedAt),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  checkMemory(): MemoryCheck {
    const { heapUsed, heapTotal, rss } = process.memoryUsage();
    const heapUsedMB = round(heapUsed / 1024 / 1024);
    const heapTotalMB = round(heapTotal / 1024 / 1024);
    const rssUsedMB = round(rss / 1024 / 1024);
    const percentUsed = round((heapUsed / heapTotal) * 100);

    return {
      status: percentUsed >= MEMORY_WARN_PERCENT ? 'warn' : 'ok',
      heapUsedMB,
      heapTotalMB,
      rssUsedMB,
      percentUsed,
    };
  }

  async checkAll(): Promise<HealthReport> {
    const [database, memory] = await Promise.all([this.checkDatabase(), this.checkMemory()]);

    let status: HealthReport['status'] = 'healthy';
    if (database.status === 'error') status = 'unhealthy';
    else if (memory.status === 'warn') status = 'degraded';

    return {
      status,
      checks: { database, memory },
      uptime: Math.round(process.uptime()),
    };
  }
}

export class MetricsCollector {
  private requests = new RingBuffer<RequestEntry>(METRICS_BUFFER_SIZE);
  private aiRequests = new RingBuffer<AiEntry>(METRICS_BUFFER_SIZE);
  private startedAt = Date.now();

  recordRequest(method: string, path: string, statusCode: number, durationMs: number): void {
    this.requests.push({ method, path, statusCode, durationMs, timestamp: Date.now() });
  }

  recordAiRequest(model: string, durationMs: number, success: boolean): void {
    this.aiRequests.push({ model, durationMs, success, timestamp: Date.now() });
  }

  getMetrics(): MetricsSnapshot {
    const requestEntries = this.requests.toArray();
    const aiEntries = this.aiRequests.toArray();

    const byStatus: Record<string, number> = {};
    let totalRequestDuration = 0;
    let errorCount = 0;

    for (const entry of requestEntries) {
      const key = String(entry.statusCode);
      byStatus[key] = (byStatus[key] ?? 0) + 1;
      totalRequestDuration += entry.durationMs;
      if (entry.statusCode >= 400) errorCount++;
    }

    let totalAiDuration = 0;
    let aiSuccessCount = 0;

    for (const entry of aiEntries) {
      totalAiDuration += entry.durationMs;
      if (entry.success) aiSuccessCount++;
    }

    return {
      requests: {
        total: requestEntries.length,
        avgDurationMs: requestEntries.length ? round(totalRequestDuration / requestEntries.length) : 0,
        errorRate: requestEntries.length ? round(errorCount / requestEntries.length, 4) : 0,
        byStatus,
      },
      ai: {
        total: aiEntries.length,
        avgDurationMs: aiEntries.length ? round(totalAiDuration / aiEntries.length) : 0,
        successRate: aiEntries.length ? round(aiSuccessCount / aiEntries.length, 4) : 0,
      },
      uptime: Math.round((Date.now() - this.startedAt) / 1000),
    };
  }
}

export const errorTracker = new ErrorTracker();
export const healthChecker = new HealthChecker();
export const metricsCollector = new MetricsCollector();
