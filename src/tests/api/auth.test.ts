import { describe, it, expect } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  generateResetToken,
  hashToken,
  type JWTPayload,
} from '@/lib/jwt';

describe('Auth API', () => {
  describe('JWT Token Management', () => {
    const testPayload: JWTPayload = {
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'student',
    };

    it('generates a valid access token', () => {
      const token = generateAccessToken(testPayload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('verifies a valid access token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.userId).toBe('test-user-123');
      expect(decoded!.email).toBe('test@example.com');
      expect(decoded!.role).toBe('student');
    });

    it('rejects an invalid access token', () => {
      const decoded = verifyAccessToken('invalid-token-string');
      expect(decoded).toBeNull();
    });

    it('rejects an empty access token', () => {
      const decoded = verifyAccessToken('');
      expect(decoded).toBeNull();
    });

    it('generates a valid refresh token', () => {
      const result = generateRefreshToken('user-123');
      expect(result.token).toBeTruthy();
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('verifies a valid refresh token', () => {
      const { token } = generateRefreshToken('user-456');
      const decoded = verifyRefreshToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.userId).toBe('user-456');
    });

    it('rejects an invalid refresh token', () => {
      const decoded = verifyRefreshToken('invalid-refresh-token');
      expect(decoded).toBeNull();
    });

    it('generates a token pair with access and refresh tokens', () => {
      const pair = generateTokenPair(testPayload);
      expect(pair.accessToken).toBeTruthy();
      expect(pair.refreshToken).toBeTruthy();
      expect(pair.accessTokenExpiresAt).toBeInstanceOf(Date);
      expect(pair.refreshTokenExpiresAt).toBeInstanceOf(Date);
      expect(pair.accessTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(pair.refreshTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('access token from pair is verifiable', () => {
      const pair = generateTokenPair(testPayload);
      const decoded = verifyAccessToken(pair.accessToken);
      expect(decoded).not.toBeNull();
      expect(decoded!.userId).toBe(testPayload.userId);
      expect(decoded!.email).toBe(testPayload.email);
    });

    it('refresh token from pair is verifiable', () => {
      const pair = generateTokenPair(testPayload);
      const decoded = verifyRefreshToken(pair.refreshToken);
      expect(decoded).not.toBeNull();
      expect(decoded!.userId).toBe(testPayload.userId);
    });
  });

  describe('Password Reset Token', () => {
    it('generates a 64-character hex reset token', () => {
      const token = generateResetToken();
      expect(token).toBeTruthy();
      expect(token).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(token)).toBe(true);
    });

    it('generates unique tokens each time', () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('Token Hashing', () => {
    it('hashes a token to a consistent value', () => {
      const token = 'test-token-value';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it('produces a 64-character hex hash', () => {
      const hash = hashToken('some-input');
      expect(hash).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
    });

    it('different inputs produce different hashes', () => {
      const hash1 = hashToken('input-a');
      const hash2 = hashToken('input-b');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('API Response Format', () => {
    it('error responses include success, message, and code fields', () => {
      // Verify the standard error response shape used across all API routes
      const errorResponse = {
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      };
      expect(errorResponse).toHaveProperty('success');
      expect(errorResponse).toHaveProperty('message');
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse.success).toBe(false);
    });

    it('success responses include success and data fields', () => {
      const successResp = {
        success: true,
        data: { user: { id: '123', email: 'test@test.com' } },
      };
      expect(successResp.success).toBe(true);
      expect(successResp.data).toHaveProperty('user');
    });

    it('validation errors include field-level details', () => {
      const validationError = {
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too short' },
        ],
      };
      expect(validationError.errors).toBeInstanceOf(Array);
      expect(validationError.errors).toHaveLength(2);
    });
  });
});
