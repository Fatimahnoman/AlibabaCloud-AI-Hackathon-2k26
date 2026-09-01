import { describe, it, expect } from 'vitest';
import { generateAccessToken, verifyAccessToken, generateResetToken, hashToken } from '@/lib/jwt';

describe('JWT Utilities', () => {
  const testPayload = { userId: 'test-user-id', email: 'test@example.com', role: 'user' };

  it('generates and verifies access token', () => {
    const token = generateAccessToken(testPayload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = verifyAccessToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(testPayload.userId);
    expect(decoded?.email).toBe(testPayload.email);
    expect(decoded?.role).toBe(testPayload.role);
  });

  it('returns null for invalid token', () => {
    const result = verifyAccessToken('invalid-token');
    expect(result).toBeNull();
  });

  it('returns null for empty token', () => {
    const result = verifyAccessToken('');
    expect(result).toBeNull();
  });
});

describe('Token Utilities', () => {
  it('generates a valid reset token', () => {
    const token = generateResetToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64);
  });

  it('generates unique reset tokens', () => {
    const token1 = generateResetToken();
    const token2 = generateResetToken();
    expect(token1).not.toBe(token2);
  });

  it('hashes tokens consistently', () => {
    const token = 'test-token';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different tokens', () => {
    const hash1 = hashToken('token-1');
    const hash2 = hashToken('token-2');
    expect(hash1).not.toBe(hash2);
  });
});
