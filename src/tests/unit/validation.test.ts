import { describe, it, expect } from 'vitest';
import { validateRequest, authSchemas, chatSchemas } from '@/lib/utils/validation';

describe('Validation', () => {
  describe('authSchemas.register', () => {
    it('validates correct registration data', () => {
      const result = validateRequest(authSchemas.register, {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = validateRequest(authSchemas.register, {
        email: 'not-an-email',
        password: 'password123',
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
        password: 'password123',
        name: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('authSchemas.login', () => {
    it('validates correct login data', () => {
      const result = validateRequest(authSchemas.login, {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing password', () => {
      const result = validateRequest(authSchemas.login, {
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('chatSchemas.sendMessage', () => {
    it('validates correct message', () => {
      const result = validateRequest(chatSchemas.sendMessage, {
        conversationId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Hello!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty content', () => {
      const result = validateRequest(chatSchemas.sendMessage, {
        conversationId: '550e8400-e29b-41d4-a716-446655440000',
        content: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID', () => {
      const result = validateRequest(chatSchemas.sendMessage, {
        conversationId: 'not-a-uuid',
        content: 'Hello!',
      });
      expect(result.success).toBe(false);
    });
  });
});
