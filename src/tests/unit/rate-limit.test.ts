import { describe, it, expect } from 'vitest';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

describe('Rate Limiter', () => {
  it('allows requests within limit', () => {
    const key = `test-allow-${Date.now()}`;
    const result = checkRateLimit(key, { windowMs: 60000, maxRequests: 5 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks requests over limit', () => {
    const key = `test-block-${Date.now()}`;
    const config = { windowMs: 60000, maxRequests: 3 };

    checkRateLimit(key, config);
    checkRateLimit(key, config);
    const third = checkRateLimit(key, config);
    expect(third.allowed).toBe(true);

    const fourth = checkRateLimit(key, config);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it('resets rate limit', () => {
    const key = `test-reset-${Date.now()}`;
    const config = { windowMs: 60000, maxRequests: 2 };

    checkRateLimit(key, config);
    checkRateLimit(key, config);

    const blocked = checkRateLimit(key, config);
    expect(blocked.allowed).toBe(false);

    resetRateLimit(key);

    const allowed = checkRateLimit(key, config);
    expect(allowed.allowed).toBe(true);
  });

  it('tracks remaining requests correctly', () => {
    const key = `test-remaining-${Date.now()}`;
    const config = { windowMs: 60000, maxRequests: 5 };

    const r1 = checkRateLimit(key, config);
    expect(r1.remaining).toBe(4);

    const r2 = checkRateLimit(key, config);
    expect(r2.remaining).toBe(3);
  });
});
