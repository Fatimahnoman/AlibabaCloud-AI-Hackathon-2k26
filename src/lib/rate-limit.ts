interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface LockoutEntry {
  lockedUntil: number;
  failedAttempts: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const lockoutStore = new Map<string, LockoutEntry>();

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
  for (const [key, entry] of lockoutStore.entries()) {
    if (now > entry.lockedUntil) {
      lockoutStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function isLockedOut(key: string): { locked: boolean; remainingMs?: number } {
  const entry = lockoutStore.get(key);
  if (!entry) return { locked: false };
  const now = Date.now();
  if (now > entry.lockedUntil) {
    lockoutStore.delete(key);
    return { locked: false };
  }
  return { locked: true, remainingMs: entry.lockedUntil - now };
}

export function recordFailedAttempt(key: string): { locked: boolean; attempts: number } {
  const existing = lockoutStore.get(key);
  const now = Date.now();

  if (existing && now < existing.lockedUntil) {
    existing.failedAttempts++;
    return { locked: true, attempts: existing.failedAttempts };
  }

  const attempts = (existing?.failedAttempts || 0) + 1;
  if (attempts >= LOCKOUT_THRESHOLD) {
    lockoutStore.set(key, { lockedUntil: now + LOCKOUT_DURATION, failedAttempts: attempts });
    return { locked: true, attempts };
  }

  lockoutStore.set(key, { lockedUntil: 0, failedAttempts: attempts });
  return { locked: false, attempts };
}

export function clearLockout(key: string): void {
  lockoutStore.delete(key);
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
};

export function checkRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
): RateLimitResult {
  const { windowMs, maxRequests } = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now + windowMs) };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: new Date(entry.resetAt) };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: new Date(entry.resetAt) };
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

export function getClientKey(request: Request, identifier?: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const accountId = identifier || '';
  return `${ip}:${accountId}`;
}

export const AUTH_RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  general: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
};

export const CHAT_RATE_LIMITS = {
  message: { windowMs: 60 * 1000, maxRequests: 60 },
  stream: { windowMs: 60 * 1000, maxRequests: 40 },
  create: { windowMs: 60 * 1000, maxRequests: 30 },
};

export const AI_RATE_LIMITS = {
  orchestrate: { windowMs: 60 * 1000, maxRequests: 10 },
  analyze: { windowMs: 60 * 1000, maxRequests: 10 },
  documents: { windowMs: 60 * 1000, maxRequests: 15 },
};

export const OUTBOUND_RATE_LIMITS = {
  verification: { windowMs: 60 * 1000, maxRequests: 20 },
  sourceScan: { windowMs: 60 * 1000, maxRequests: 30 },
};

export const GLOBAL_RATE_LIMIT = { windowMs: 60 * 1000, maxRequests: 200 };
