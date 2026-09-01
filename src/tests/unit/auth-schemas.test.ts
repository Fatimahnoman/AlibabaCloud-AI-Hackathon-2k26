import { describe, it, expect } from 'vitest';
import { validateRequest, authSchemas } from '@/lib/utils/validation';

describe('Auth Validation Schemas', () => {
  describe('Register Schema', () => {
    it('validates correct registration data', () => {
      const result = validateRequest(authSchemas.register, {
        email: 'test@example.com',
        password: 'StrongP@ss1',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('validates with optional fields', () => {
      const result = validateRequest(authSchemas.register, {
        email: 'test@example.com',
        password: 'StrongP@ss1',
        name: 'Test User',
        country: 'Pakistan',
        preferredLanguage: 'roman_urdu',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = validateRequest(authSchemas.register, {
        email: 'not-an-email',
        password: 'StrongP@ss1',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = validateRequest(authSchemas.register, {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const result = validateRequest(authSchemas.register, {
        email: 'test@example.com',
        password: 'StrongP@ss1',
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid preferred language', () => {
      const result = validateRequest(authSchemas.register, {
        email: 'test@example.com',
        password: 'StrongP@ss1',
        name: 'Test User',
        preferredLanguage: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Login Schema', () => {
    it('validates correct login data', () => {
      const result = validateRequest(authSchemas.login, {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = validateRequest(authSchemas.login, {
        email: 'invalid',
        password: 'password',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const result = validateRequest(authSchemas.login, {
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
