import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { z } from 'zod';
import path from 'node:path';
import { constants } from 'node:fs';
import * as fsPromises from 'node:fs/promises';

vi.mock('@/lib/prisma', () => {
  const queryRaw = vi.fn();
  return {
    default: { $queryRaw: queryRaw },
    prisma: { $queryRaw: queryRaw },
  };
});

vi.mock('node:fs/promises', () => {
  const fsMock = {
    mkdir: vi.fn(),
    copyFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
    access: vi.fn(),
  };
  return { ...fsMock, default: fsMock };
});

import prisma from '@/lib/prisma';
import { Logger, logger, createLogger } from '@/lib/logger';
import {
  ErrorTracker,
  HealthChecker,
  MetricsCollector,
  type DatabaseCheck,
} from '@/lib/monitoring';
import {
  validateRequest,
  validateQuery,
  validateParams,
  paginationSchema,
  idSchema,
} from '@/lib/api-validation';
import { SecurityAuditor } from '@/lib/security-audit';
import { DbOptimizer } from '@/lib/db-optimization';
import { BackupManager } from '@/lib/backup';

const mockedPrisma = vi.mocked(prisma);
const mockedFs = vi.mocked(fsPromises);

function jsonRequest(body: unknown): Request {
  return { json: async () => body } as unknown as Request;
}

function brokenJsonRequest(): Request {
  return {
    json: async () => {
      throw new SyntaxError('Unexpected token');
    },
  } as unknown as Request;
}

function urlRequest(url: string): Request {
  return { url } as unknown as Request;
}

describe('Logger', () => {
  let logSpy: MockInstance;
  let warnSpy: MockInstance;
  let errorSpy: MockInstance;
  let debugSpy: MockInstance;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('writes info logs through console.log with INFO level and service tag', () => {
    new Logger({ service: 'svc' }).info('hello', { userId: 'u1' });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const line = String(logSpy.mock.calls[0][0]);
    expect(line).toContain('[INFO]');
    expect(line).toContain('[svc]');
    expect(line).toContain('hello');
    expect(line).toContain('"userId":"u1"');
    expect(line).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('writes warn logs through console.warn', () => {
    new Logger().warn('careful');

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).not.toHaveBeenCalled();
    expect(String(warnSpy.mock.calls[0][0])).toContain('[WARN]');
  });

  it('writes debug logs through console.debug', () => {
    new Logger().debug('trace-detail');

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(String(debugSpy.mock.calls[0][0])).toContain('[DEBUG]');
  });

  it('writes error logs through console.error', () => {
    new Logger().error('something failed');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).not.toHaveBeenCalled();
    expect(String(errorSpy.mock.calls[0][0])).toContain('[ERROR]');
  });

  it('extracts name, message and stack when an Error is passed to error()', () => {
    new Logger().error('op failed', new Error('boom'));

    const line = String(errorSpy.mock.calls[0][0]);
    expect(line).toContain('"name":"Error"');
    expect(line).toContain('"message":"boom"');
    expect(line).toContain('"stack"');
  });

  it('merges an Error and an explicit context object in error()', () => {
    new Logger().error('op failed', new Error('boom'), { userId: 'u1' });

    const line = String(errorSpy.mock.calls[0][0]);
    expect(line).toContain('"userId":"u1"');
    expect(line).toContain('"message":"boom"');
  });

  it('stringifies non-Error values and accepts plain context objects in error()', () => {
    new Logger().error('bad value', 'raw-string');
    new Logger().error('with ctx', { userId: 7 });

    expect(String(errorSpy.mock.calls[0][0])).toContain('"value":"raw-string"');
    expect(String(errorSpy.mock.calls[1][0])).toContain('"userId":7');
  });

  it('createLogger pins the logger to the given service name', () => {
    createLogger('auth-service').info('signed in');

    const line = String(logSpy.mock.calls[0][0]);
    expect(line).toContain('[auth-service]');
    expect(line).not.toContain('[eduguard]');
  });

  it('falls back to the eduguard default service on the shared singleton', () => {
    logger.info('default service log');

    expect(String(logSpy.mock.calls[0][0])).toContain('[eduguard]');
  });
});

describe('ErrorTracker', () => {
  let tracker: ErrorTracker;

  beforeEach(() => {
    tracker = new ErrorTracker();
  });

  it('captures errors with name, message, context and timestamp', () => {
    tracker.capture(new Error('first'), { route: '/api/x' });

    const recent = tracker.getRecent();
    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe('Error');
    expect(recent[0].message).toBe('first');
    expect(recent[0].context).toEqual({ route: '/api/x' });
    expect(typeof recent[0].timestamp).toBe('number');
  });

  it('returns most recent errors first', () => {
    tracker.capture(new Error('e1'));
    tracker.capture(new Error('e2'));
    tracker.capture(new Error('e3'));

    expect(tracker.getRecent().map((e) => e.message)).toEqual(['e3', 'e2', 'e1']);
  });

  it('respects the limit argument', () => {
    tracker.capture(new Error('e1'));
    tracker.capture(new Error('e2'));
    tracker.capture(new Error('e3'));

    expect(tracker.getRecent(2).map((e) => e.message)).toEqual(['e3', 'e2']);
  });

  it('computes stats grouped by error type within the last 24 hours', () => {
    tracker.capture(new TypeError('t1'));
    tracker.capture(new TypeError('t2'));
    tracker.capture(new RangeError('r1'));

    const stats = tracker.getStats();
    expect(stats.total).toBe(3);
    expect(stats.last24h).toBe(3);
    expect(stats.byType).toEqual({ TypeError: 2, RangeError: 1 });
  });

  it('clear resets the buffer and counters', () => {
    tracker.capture(new Error('e1'));

    tracker.clear();

    expect(tracker.getRecent()).toHaveLength(0);
    expect(tracker.getStats()).toEqual({ total: 0, last24h: 0, byType: {} });
  });

  it('ring buffer keeps only the newest 1000 entries while total counts every capture', () => {
    for (let i = 0; i < 1010; i++) {
      tracker.capture(new Error(`err-${i}`));
    }

    expect(tracker.getRecent(2000)).toHaveLength(1000);
    expect(tracker.getRecent(5)[0].message).toBe('err-1009');
    expect(tracker.getStats().total).toBe(1010);
  });
});

describe('HealthChecker', () => {
  let checker: HealthChecker;

  beforeEach(() => {
    checker = new HealthChecker();
    mockedPrisma.$queryRaw.mockReset();
    mockedPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
  });

  it('reports healthy when the database responds', async () => {
    const report = await checker.checkAll();

    expect(mockedPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(report.status).toBe('healthy');
    expect(report.checks.database.status).toBe('ok');
    expect((report.checks.database as DatabaseCheck).latencyMs).toBeGreaterThanOrEqual(0);
    expect(report.checks.memory.status).toBe('ok');
    expect(report.uptime).toBeGreaterThanOrEqual(0);
  });

  it('reports unhealthy with the error message when the database fails', async () => {
    mockedPrisma.$queryRaw.mockRejectedValueOnce(new Error('connection refused'));

    const report = await checker.checkAll();

    expect(report.status).toBe('unhealthy');
    expect(report.checks.database.status).toBe('error');
    expect((report.checks.database as DatabaseCheck).error).toBe('connection refused');
  });

  it('checkMemory reports heap and rss figures under normal usage', () => {
    const memory = checker.checkMemory();

    expect(memory.heapUsedMB).toBeGreaterThan(0);
    expect(memory.heapTotalMB).toBeGreaterThan(0);
    expect(memory.rssUsedMB).toBeGreaterThan(0);
    expect(memory.percentUsed).toBeGreaterThanOrEqual(0);
    expect(memory.percentUsed).toBeLessThanOrEqual(100);
  });

  it('flags memory as warn above 85% usage which degrades the whole report', async () => {
    const spy = vi.spyOn(process, 'memoryUsage').mockReturnValue({
      heapUsed: 90 * 1024 * 1024,
      heapTotal: 100 * 1024 * 1024,
      rss: 150 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0,
    } as NodeJS.MemoryUsage);

    try {
      const memory = checker.checkMemory();
      expect(memory.status).toBe('warn');
      expect(memory.percentUsed).toBe(90);

      const report = await checker.checkAll();
      expect(report.status).toBe('degraded');
      expect(report.checks.database.status).toBe('ok');
    } finally {
      spy.mockRestore();
    }
  });
});

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  it('aggregates request counts by status code', () => {
    collector.recordRequest('GET', '/api/a', 200, 10);
    collector.recordRequest('POST', '/api/b', 200, 30);
    collector.recordRequest('POST', '/api/c', 500, 20);

    const metrics = collector.getMetrics();
    expect(metrics.requests.total).toBe(3);
    expect(metrics.requests.byStatus).toEqual({ '200': 2, '500': 1 });
  });

  it('calculates average request duration', () => {
    collector.recordRequest('GET', '/a', 200, 10);
    collector.recordRequest('GET', '/b', 200, 30);

    expect(collector.getMetrics().requests.avgDurationMs).toBe(20);
  });

  it('counts statuses >= 400 towards the error rate rounded to four decimals', () => {
    collector.recordRequest('GET', '/a', 200, 5);
    collector.recordRequest('GET', '/b', 404, 5);
    collector.recordRequest('GET', '/c', 500, 5);

    expect(collector.getMetrics().requests.errorRate).toBe(0.6667);
  });

  it('tracks AI requests with average duration and success rate', () => {
    collector.recordAiRequest('llama-3', 120, true);
    collector.recordAiRequest('llama-3', 180, true);
    collector.recordAiRequest('mixtral', 300, false);

    const ai = collector.getMetrics().ai;
    expect(ai.total).toBe(3);
    expect(ai.avgDurationMs).toBe(200);
    expect(ai.successRate).toBe(0.6667);
  });

  it('returns zeroed metrics when nothing was recorded', () => {
    const metrics = collector.getMetrics();

    expect(metrics.requests).toEqual({
      total: 0,
      avgDurationMs: 0,
      errorRate: 0,
      byStatus: {},
    });
    expect(metrics.ai).toEqual({ total: 0, avgDurationMs: 0, successRate: 0 });
    expect(metrics.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe('validateRequest', () => {
  const bodySchema = z.object({
    email: z.string().email(),
    age: z.coerce.number().min(18),
  });

  it('returns parsed data for a valid JSON body', async () => {
    const result = await validateRequest(bodySchema)(
      jsonRequest({ email: 'a@b.com', age: '21' })
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ email: 'a@b.com', age: 21 });
    }
  });

  it('returns a 400 response with per-field details for an invalid body', async () => {
    const result = await validateRequest(bodySchema)(
      jsonRequest({ email: 'not-an-email', age: 10 })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      const payload = await result.error.json();
      expect(result.error.status).toBe(400);
      expect(payload.code).toBe('VALIDATION_ERROR');
      expect(payload.details).toHaveProperty('email');
      expect(payload.details).toHaveProperty('age');
    }
  });

  it('rejects bodies that are not valid JSON before schema parsing', async () => {
    const result = await validateRequest(bodySchema)(brokenJsonRequest());

    expect(result.success).toBe(false);
    if (!result.success) {
      const payload = await result.error.json();
      expect(payload.message).toBe('Invalid JSON body');
      expect(result.error.status).toBe(400);
    }
  });

  it('paginationSchema applies page=1 and limit=20 defaults to an empty body', async () => {
    const result = await validateRequest(paginationSchema)(jsonRequest({}));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1, limit: 20 });
    }
  });

  it('paginationSchema coerces numeric strings and enforces bounds', async () => {
    const coerced = await validateRequest(paginationSchema)(
      jsonRequest({ page: '3', limit: '50' })
    );
    expect(coerced.success).toBe(true);
    if (coerced.success) {
      expect(coerced.data).toEqual({ page: 3, limit: 50 });
    }

    const outOfRange = await validateRequest(paginationSchema)(
      jsonRequest({ page: 0, limit: 101 })
    );
    expect(outOfRange.success).toBe(false);
    if (!outOfRange.success) {
      const payload = await outOfRange.error.json();
      expect(payload.details).toHaveProperty('page');
      expect(payload.details).toHaveProperty('limit');
    }
  });
});

describe('validateQuery', () => {
  it('parses and coerces query parameters against paginationSchema', () => {
    const result = validateQuery(paginationSchema)(
      urlRequest('https://edu.local/api/items?page=2&limit=50')
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 2, limit: 50 });
    }
  });

  it('fails for out-of-range query values with a 400 response', () => {
    const result = validateQuery(paginationSchema)(
      urlRequest('https://edu.local/api/items?limit=9999')
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.status).toBe(400);
    }
  });

  it('skips empty query values so optional fields stay undefined', () => {
    const schema = paginationSchema.extend({ search: z.string().optional() });
    const result = validateQuery(schema)(
      urlRequest('https://edu.local/api/items?search=&page=4')
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 4, limit: 20, search: undefined });
    }
  });

  it('collects repeated keys into arrays for array-shaped schemas', () => {
    const tagsSchema = z.object({ tag: z.array(z.string()) });
    const result = validateQuery(tagsSchema)(
      urlRequest('https://edu.local/api/items?tag=a&tag=b')
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tag).toEqual(['a', 'b']);
    }
  });
});

describe('validateParams', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

  it('accepts a well-formed uuid', async () => {
    const result = await validateParams(idSchema)({ id: VALID_UUID });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(VALID_UUID);
    }
  });

  it('rejects malformed ids with a field-level message', async () => {
    const result = await validateParams(idSchema)({ id: 'not-a-uuid' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const payload = await result.error.json();
      expect(payload.details.id).toBe('Invalid ID format');
    }
  });

  it('resolves params supplied as a promise like Next.js dynamic APIs', async () => {
    const result = await validateParams(idSchema)(
      Promise.resolve({ id: VALID_UUID })
    );

    expect(result.success).toBe(true);
  });
});

describe('SecurityAuditor', () => {
  const auditor = new SecurityAuditor();
  const ENV_KEYS = [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'NEXT_PUBLIC_APP_URL',
    'GROQ_API_KEY',
    'CORS_ALLOWED_ORIGINS',
  ] as const;
  let savedEnv: Record<string, string | undefined>;
  const env = process.env as unknown as Record<string, string | undefined>;

  beforeEach(() => {
    savedEnv = {};
    for (const key of ENV_KEYS) savedEnv[key] = process.env[key];
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete env[key];
      else env[key] = savedEnv[key];
    }
  });

  function setEnv(vars: Record<string, string | undefined>): void {
    for (const [key, value] of Object.entries(vars)) {
      if (value === undefined) delete env[key];
      else env[key] = value;
    }
  }

  function productionDefaults(): Record<string, string> {
    return {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
      NEXT_PUBLIC_APP_URL: 'https://app.example.com',
      GROQ_API_KEY: 'groq-key-123',
    };
  }

  it('passes with no issues or warnings when production env is fully configured', () => {
    setEnv(productionDefaults());
    delete process.env.CORS_ALLOWED_ORIGINS;

    const result = auditor.checkEnvironment();

    expect(result.passed).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('lists every missing required variable and treats blank strings as missing', () => {
    setEnv({
      NODE_ENV: 'production',
      DATABASE_URL: '   ',
      GROQ_API_KEY: 'key',
    });

    const result = auditor.checkEnvironment();

    expect(result.passed).toBe(false);
    for (const name of ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'NEXT_PUBLIC_APP_URL']) {
      expect(result.issues).toContain(`Missing required environment variable: ${name}`);
    }
  });

  it('flags secrets shorter than 32 characters only in production', () => {
    setEnv(productionDefaults());
    process.env.JWT_SECRET = 'short-secret';

    const prodResult = auditor.checkEnvironment();
    expect(prodResult.passed).toBe(false);
    expect(prodResult.issues).toContain(
      'JWT_SECRET must be at least 32 characters in production (current: 12)'
    );

    setEnv({ NODE_ENV: 'development' });
    const devResult = auditor.checkEnvironment();
    expect(devResult.passed).toBe(true);
    expect(devResult.issues).toEqual([]);
  });

  it('warns when a secret still contains the default placeholder', () => {
    setEnv(productionDefaults());
    process.env.JWT_SECRET = 'change-this-insecure-placeholder';

    const result = auditor.checkEnvironment();

    expect(
      result.warnings.some((w) =>
        w.startsWith('JWT_SECRET still contains the default placeholder')
      )
    ).toBe(true);
  });

  it('warns when GROQ_API_KEY is absent because AI features would be unavailable', () => {
    setEnv(productionDefaults());
    delete process.env.GROQ_API_KEY;

    const result = auditor.checkEnvironment();

    expect(result.passed).toBe(true);
    expect(result.warnings).toContain(
      'GROQ_API_KEY is not set; AI features will be unavailable'
    );
  });

  it('escalates a CORS wildcard to an issue in production but only warns in development', () => {
    setEnv(productionDefaults());
    process.env.CORS_ALLOWED_ORIGINS = '*';

    expect(auditor.checkEnvironment().issues).toContain(
      'CORS_ALLOWED_ORIGINS must not include "*" in production'
    );

    setEnv({ NODE_ENV: 'development' });
    expect(auditor.checkEnvironment().warnings).toContain(
      'CORS wildcard "*" detected; restrict allowed origins before deploying'
    );
  });

  it('runFullAudit scores a clean production setup at 100 and passes', () => {
    setEnv(productionDefaults());

    const audit = auditor.runFullAudit();

    expect(audit.score).toBe(100);
    expect(audit.passed).toBe(true);
    expect(audit.results.environment.passed).toBe(true);
    expect(audit.results.passwords.passed).toBe(true);
    expect(audit.results.passwords.currentRounds).toBe(12);
    expect(audit.results.cors.wildcard).toBe(false);
    expect(audit.results.headers.length).toBeGreaterThan(0);
  });

  it('runFullAudit deducts 15 points per environment issue and fails below 90', () => {
    setEnv(productionDefaults());
    delete process.env.DATABASE_URL;

    const audit = auditor.runFullAudit();

    expect(audit.score).toBe(85);
    expect(audit.passed).toBe(false);
    expect(audit.results.environment.issues).toHaveLength(1);
  });

  it('runFullAudit deducts 5 points per warning but still passes above the threshold', () => {
    setEnv(productionDefaults());
    delete process.env.GROQ_API_KEY;

    const audit = auditor.runFullAudit();

    expect(audit.score).toBe(95);
    expect(audit.passed).toBe(true);
    expect(audit.results.environment.warnings).toHaveLength(1);
  });
});

describe('DbOptimizer', () => {
  let optimizer: DbOptimizer;

  beforeEach(() => {
    optimizer = new DbOptimizer({} as never);
  });

  it('withRetry resolves on the first attempt without retrying', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    const result = await optimizer.withRetry(fn, 3, 1);

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('withRetry retries transient failures with backoff and then succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('transient-1'))
      .mockRejectedValueOnce(new Error('transient-2'))
      .mockResolvedValueOnce('recovered');

    const result = await optimizer.withRetry(fn, 3, 1);

    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('withRetry throws the last error after exhausting all retries', async () => {
    const failure = new Error('permanent');
    const fn = vi.fn().mockRejectedValue(failure);

    await expect(optimizer.withRetry(fn, 2, 1)).rejects.toBe(failure);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('measureQuery returns the query result and logs the elapsed time', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      const result = await optimizer.measureQuery('users.findAll', async () => ({
        id: 'u1',
      }));

      expect(result).toEqual({ id: 'u1' });
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\[db\] users\.findAll completed in \d+ms$/)
      );
    } finally {
      logSpy.mockRestore();
    }
  });

  it('measureQuery logs timing even when the query rejects', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const failure = new Error('query blew up');

    try {
      await expect(
        optimizer.measureQuery('broken.query', () => Promise.reject(failure))
      ).rejects.toBe(failure);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[db] broken.query completed in')
      );
    } finally {
      logSpy.mockRestore();
    }
  });

  it('batchQueries preserves the results order of the provided queries', async () => {
    const queries: Array<() => Promise<unknown>> = [
      () => Promise.resolve(1),
      () => Promise.resolve('two'),
      () => Promise.resolve([3]),
    ];

    const results = await optimizer.batchQueries(queries);

    expect(results).toEqual([1, 'two', [3]]);
  });

  it('batchQueries starts every query in parallel before awaiting completion', async () => {
    const started: string[] = [];
    const gates: Array<{ promise: Promise<void>; release: () => void }> = [];

    for (let i = 0; i < 3; i++) {
      let release!: () => void;
      const promise = new Promise<void>((resolve) => {
        release = resolve;
      });
      gates.push({ promise, release });
    }

    const queries = gates.map((gate, index) => async () => {
      started.push(`start-${index}`);
      await gate.promise;
      return index;
    });

    const batchPromise = optimizer.batchQueries(queries);

    expect(started).toEqual(['start-0', 'start-1', 'start-2']);

    for (const gate of gates) gate.release();
    await expect(batchPromise).resolves.toEqual([0, 1, 2]);
  });
});

describe('BackupManager', () => {
  const PROJECT_ROOT = path.resolve(process.cwd(), 'fake-project-root');
  const DEFAULT_BACKUP_DIR = path.join(PROJECT_ROOT, 'backups');
  const SOURCE_DB = path.join(PROJECT_ROOT, 'prisma', 'dev.db');
  let manager: BackupManager;

  beforeEach(() => {
    manager = new BackupManager(PROJECT_ROOT);
    mockedFs.mkdir.mockReset().mockResolvedValue(undefined as never);
    mockedFs.copyFile.mockReset().mockResolvedValue(undefined as never);
    mockedFs.readdir.mockReset().mockResolvedValue([] as never);
    mockedFs.unlink.mockReset().mockResolvedValue(undefined as never);
    mockedFs.access.mockReset().mockResolvedValue(undefined as never);
    mockedFs.stat.mockReset();
  });

  it('createBackup copies the source database into a timestamped file', async () => {
    mockedFs.stat.mockResolvedValue({ size: 4096, mtime: new Date() } as never);

    const result = await manager.createBackup();

    expect(mockedFs.mkdir).toHaveBeenCalledWith(DEFAULT_BACKUP_DIR, { recursive: true });
    expect(mockedFs.copyFile).toHaveBeenCalledTimes(1);
    expect(mockedFs.copyFile.mock.calls[0][0]).toBe(SOURCE_DB);
    const destination = String(mockedFs.copyFile.mock.calls[0][1]);
    expect(path.dirname(destination)).toBe(DEFAULT_BACKUP_DIR);
    expect(path.basename(destination)).toMatch(/^dev-backup-.+\.db$/);

    expect(result.path).toBe(destination);
    expect(result.sizeBytes).toBe(4096);
    expect(new Date(result.timestamp).toISOString()).toBeTruthy();
  });

  it('createBackup honours a custom backup directory resolved to an absolute path', async () => {
    mockedFs.stat.mockResolvedValue({ size: 1, mtime: new Date() } as never);
    const customDir = path.join(PROJECT_ROOT, 'tmp', 'custom-backups');

    await manager.createBackup(customDir);

    expect(mockedFs.mkdir).toHaveBeenCalledWith(customDir, { recursive: true });
    expect(path.dirname(String(mockedFs.copyFile.mock.calls[0][1]))).toBe(customDir);
  });

  it('createBackup throws a friendly error when the source database is missing', async () => {
    mockedFs.copyFile.mockRejectedValue({ code: 'ENOENT' });

    await expect(manager.createBackup()).rejects.toThrow(
      `Source database not found at ${SOURCE_DB}`
    );
  });

  it('createBackup throws a permission error when writing is denied', async () => {
    mockedFs.copyFile.mockRejectedValue({ code: 'EACCES' });

    await expect(manager.createBackup()).rejects.toThrow(
      /^Permission denied while writing backup/
    );
  });

  it('listBackups filters non-.db files and sorts newest first', async () => {
    mockedFs.readdir.mockResolvedValue([
      'older.db',
      'notes.txt',
      'newer.db',
    ] as never);
    mockedFs.stat
      .mockResolvedValueOnce({
        size: 100,
        mtime: new Date('2026-01-01T10:00:00Z'),
      } as never)
      .mockResolvedValueOnce({
        size: 250,
        mtime: new Date('2026-01-03T10:00:00Z'),
      } as never);

    const backups = await manager.listBackups();

    expect(backups.map((b) => b.filename)).toEqual(['newer.db', 'older.db']);
    expect(backups[0].sizeBytes).toBe(250);
    expect(backups[1].sizeBytes).toBe(100);
    expect(backups[1].createdAt).toBe('2026-01-01T10:00:00.000Z');
  });

  it('listBackups returns an empty array when the directory does not exist', async () => {
    mockedFs.readdir.mockRejectedValue({ code: 'ENOENT' });

    await expect(manager.listBackups()).resolves.toEqual([]);
  });

  it('listBackups surfaces permission errors from the directory read', async () => {
    mockedFs.readdir.mockRejectedValue({ code: 'EACCES' });

    await expect(manager.listBackups()).rejects.toThrow(
      `Permission denied while reading backup directory ${DEFAULT_BACKUP_DIR}`
    );
  });

  it('restoreBackup copies the chosen backup over the source database', async () => {
    const backupPath = path.join(DEFAULT_BACKUP_DIR, 'dev-backup-good.db');

    const result = await manager.restoreBackup(backupPath);

    expect(result.success).toBe(true);
    expect(result.restoredFrom).toBe(backupPath);
    expect(mockedFs.access).toHaveBeenCalledWith(backupPath, constants.F_OK);
    expect(mockedFs.mkdir).toHaveBeenCalledWith(path.dirname(SOURCE_DB), {
      recursive: true,
    });
    expect(mockedFs.copyFile).toHaveBeenCalledWith(backupPath, SOURCE_DB);
  });

  it('restoreBackup reports failure without copying when the backup is missing', async () => {
    const missingPath = path.join(DEFAULT_BACKUP_DIR, 'ghost.db');
    mockedFs.access.mockRejectedValue({ code: 'ENOENT' });

    const result = await manager.restoreBackup(missingPath);

    expect(result.success).toBe(false);
    expect(result.restoredFrom).toBe(missingPath);
    expect(mockedFs.mkdir).not.toHaveBeenCalled();
    expect(mockedFs.copyFile).not.toHaveBeenCalled();
  });

  it('restoreBackup throws a permission error when restore access is denied', async () => {
    mockedFs.access.mockRejectedValue({ code: 'EACCES' });

    await expect(manager.restoreBackup('locked.db')).rejects.toThrow(
      /^Permission denied while restoring backup/
    );
  });

  it('cleanupOldBackups deletes only backups beyond keepCount, newest are kept', async () => {
    mockedFs.readdir.mockResolvedValue([
      'v1.db',
      'v2.db',
      'v3.db',
      'v4.db',
      'v5.db',
    ] as never);
    mockedFs.stat
      .mockResolvedValueOnce({
        size: 1,
        mtime: new Date('2026-01-01T00:00:00Z'),
      } as never)
      .mockResolvedValueOnce({
        size: 1,
        mtime: new Date('2026-01-02T00:00:00Z'),
      } as never)
      .mockResolvedValueOnce({
        size: 1,
        mtime: new Date('2026-01-03T00:00:00Z'),
      } as never)
      .mockResolvedValueOnce({
        size: 1,
        mtime: new Date('2026-01-04T00:00:00Z'),
      } as never)
      .mockResolvedValueOnce({
        size: 1,
        mtime: new Date('2026-01-05T00:00:00Z'),
      } as never);

    const deleted = await manager.cleanupOldBackups(2);

    expect(deleted).toEqual(['v3.db', 'v2.db', 'v1.db']);
    expect(mockedFs.unlink).toHaveBeenCalledTimes(3);
    expect(mockedFs.unlink).toHaveBeenNthCalledWith(
      1,
      path.join(DEFAULT_BACKUP_DIR, 'v3.db')
    );
    expect(mockedFs.unlink).toHaveBeenNthCalledWith(
      3,
      path.join(DEFAULT_BACKUP_DIR, 'v1.db')
    );
    for (const kept of ['v5.db', 'v4.db']) {
      expect(mockedFs.unlink).not.toHaveBeenCalledWith(
        path.join(DEFAULT_BACKUP_DIR, kept)
      );
    }
  });

  it('cleanupOldBackups keeps everything when under the default keepCount of 10', async () => {
    mockedFs.readdir.mockResolvedValue(['a.db', 'b.db'] as never);
    mockedFs.stat
      .mockResolvedValueOnce({ size: 1, mtime: new Date() } as never)
      .mockResolvedValueOnce({ size: 1, mtime: new Date() } as never);

    const deleted = await manager.cleanupOldBackups();

    expect(deleted).toEqual([]);
    expect(mockedFs.unlink).not.toHaveBeenCalled();
  });

  it('cleanupOldBackups skips entries that were already removed without failing', async () => {
    mockedFs.readdir.mockResolvedValue(['gone.db', 'stay.db'] as never);
    mockedFs.stat
      .mockResolvedValueOnce({
        size: 1,
        mtime: new Date('2026-01-01T00:00:00Z'),
      } as never)
      .mockResolvedValueOnce({
        size: 1,
        mtime: new Date('2026-01-02T00:00:00Z'),
      } as never);
    mockedFs.unlink.mockRejectedValue({ code: 'ENOENT' });

    const deleted = await manager.cleanupOldBackups(1);

    expect(deleted).toEqual([]);
    expect(mockedFs.unlink).toHaveBeenCalledTimes(1);
  });
});
