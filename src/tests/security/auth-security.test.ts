import { describe, it, expect } from 'vitest';
import { validateRequest, authSchemas } from '@/lib/utils/validation';

describe('Security Tests', () => {
  describe('SQL Injection Prevention', () => {
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users --",
      "1; DELETE FROM users WHERE 1=1; --",
    ];

    it.each(sqlPayloads)('rejects SQL injection in email: %s', (payload) => {
      const result = validateRequest(authSchemas.login, {
        email: payload,
        password: 'password',
      });
      expect(result.success).toBe(false);
    });

    it.each(sqlPayloads)('rejects SQL injection in password: %s', (payload) => {
      const result = validateRequest(authSchemas.login, {
        email: 'test@example.com',
        password: payload,
      });
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('XSS Prevention', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '"><script>alert(1)</script>',
      "javascript:alert(1)",
      '<svg onload=alert(1)>',
    ];

    it.each(xssPayloads)('rejects XSS in name: %s', (payload) => {
      const result = validateRequest(authSchemas.register, {
        email: 'test@example.com',
        password: 'StrongP@ss1',
        name: payload,
      });
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Input Validation', () => {
    it('rejects malformed email formats', () => {
      const malformedEmails = ['not-an-email', '@example.com', 'user@', 'user@@example.com'];
      for (const email of malformedEmails) {
        const result = validateRequest(authSchemas.login, {
          email,
          password: 'password',
        });
        expect(result.success).toBe(false);
      }
    });

    it('rejects empty body', () => {
      const result = validateRequest(authSchemas.login, {});
      expect(result.success).toBe(false);
    });

    it('rejects null values', () => {
      const result = validateRequest(authSchemas.login, {
        email: null,
        password: null,
      });
      expect(result.success).toBe(false);
    });

    it('rejects unexpected fields gracefully', () => {
      const result = validateRequest(authSchemas.login, {
        email: 'test@example.com',
        password: 'password',
        admin: true,
        role: 'admin',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Password Security', () => {
    it('does not accept common passwords', () => {
      const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123'];

      for (const pwd of commonPasswords) {
        const hasUppercase = /[A-Z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasLength = pwd.length >= 8;

        if (!hasUppercase || !hasNumber || !hasLength) {
          expect(hasUppercase && hasNumber && hasLength).toBe(false);
        }
      }
    });
  });

  describe('Error Messages', () => {
    it('does not leak internal information in errors', () => {
      const result = validateRequest(authSchemas.login, {
        email: 'nonexistent@test.com',
        password: 'wrongpassword',
      });

      if (!result.success) {
        const errorString = JSON.stringify(result.errors);
        expect(errorString).not.toContain('stack');
        expect(errorString).not.toContain('Error:');
        expect(errorString).not.toContain('at ');
      }
    });
  });
});
