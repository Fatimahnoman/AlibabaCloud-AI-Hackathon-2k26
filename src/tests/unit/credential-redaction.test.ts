import { describe, it, expect } from 'vitest';
import {
  redactSensitiveData,
  containsSensitiveData,
  redactForLogging,
  REDACTED,
} from '@/lib/credential-redaction';

describe('Credential Redaction', () => {
  describe('redactSensitiveData', () => {
    it('replaces OTP patterns', () => {
      expect(redactSensitiveData('Your OTP is 483921')).toBe(`Your ${REDACTED}`);
      expect(redactSensitiveData('OTP 483921')).toBe(REDACTED);
      expect(redactSensitiveData('otp: 123456')).toBe(REDACTED);
      expect(redactSensitiveData('OTP=998877')).toBe(REDACTED);
    });

    it('replaces code-is patterns', () => {
      expect(redactSensitiveData('The code is 483921')).toBe(`The ${REDACTED}`);
      expect(redactSensitiveData('Code is 1234')).toBe(REDACTED);
    });

    it('replaces credit card numbers', () => {
      expect(redactSensitiveData('Card: 4111 1111 1111 1111')).toContain(REDACTED);
      expect(redactSensitiveData('4111-1111-1111-1111')).toBe(REDACTED);
      expect(redactSensitiveData('4111111111111111')).toBe(REDACTED);
    });

    it('replaces CVV patterns', () => {
      expect(redactSensitiveData('CVV: 123')).toBe(REDACTED);
      expect(redactSensitiveData('cvv=4567')).toBe(REDACTED);
      expect(redactSensitiveData('cvv 789')).toBe(REDACTED);
    });

    it('replaces password patterns', () => {
      expect(redactSensitiveData('password: secret123')).toBe(`password: ${REDACTED}`);
      expect(redactSensitiveData('passwd=mysecurepass')).toBe(`passwd= ${REDACTED}`);
      expect(redactSensitiveData('pwd: abcdef')).toBe(`pwd: ${REDACTED}`);
    });

    it('preserves normal text without sensitive data', () => {
      const normal = 'Hello, how are you today?';
      expect(redactSensitiveData(normal)).toBe(normal);
    });

    it('handles mixed content with multiple sensitive patterns', () => {
      const input = 'Your OTP is 483921 and card is 4111 1111 1111 1111';
      const result = redactSensitiveData(input);
      expect(result).not.toContain('483921');
      expect(result).not.toContain('4111');
      expect(result).toContain(REDACTED);
    });
  });

  describe('containsSensitiveData', () => {
    it('detects OTP data', () => {
      const result = containsSensitiveData('Your OTP is 483921');
      expect(result.hasSensitive).toBe(true);
      expect(result.types).toContain('otp');
    });

    it('detects PIN data', () => {
      const result = containsSensitiveData('Enter PIN: 1234');
      expect(result.hasSensitive).toBe(true);
      expect(result.types).toContain('pin');
    });

    it('detects CVV data', () => {
      const result = containsSensitiveData('CVV: 123');
      expect(result.hasSensitive).toBe(true);
      expect(result.types).toContain('cvv');
    });

    it('detects password data', () => {
      const result = containsSensitiveData('password: mysecret');
      expect(result.hasSensitive).toBe(true);
      expect(result.types).toContain('password');
    });

    it('detects credit card numbers', () => {
      const result = containsSensitiveData('Card number: 4111 1111 1111 1111');
      expect(result.hasSensitive).toBe(true);
      expect(result.types).toContain('card_number');
    });

    it('returns false for normal text', () => {
      const result = containsSensitiveData('The weather is nice today');
      expect(result.hasSensitive).toBe(false);
      expect(result.types).toHaveLength(0);
    });

    it('returns false for empty string', () => {
      const result = containsSensitiveData('');
      expect(result.hasSensitive).toBe(false);
      expect(result.types).toHaveLength(0);
    });

    it('detects multiple sensitive types in one text', () => {
      const result = containsSensitiveData(
        'OTP is 483921 and password: secret123'
      );
      expect(result.hasSensitive).toBe(true);
      expect(result.types.length).toBeGreaterThanOrEqual(2);
      expect(result.types).toContain('otp');
      expect(result.types).toContain('password');
    });
  });

  describe('redactForLogging', () => {
    it('performs aggressive redaction including long numeric strings', () => {
      const result = redactForLogging('User ID 123456789012');
      expect(result).not.toContain('123456789012');
      expect(result).toContain(REDACTED);
    });

    it('redacts standard sensitive patterns', () => {
      const result = redactForLogging('Your OTP is 483921');
      expect(result).not.toContain('483921');
    });

    it('preserves short text without sensitive data', () => {
      const normal = 'Hello world';
      expect(redactForLogging(normal)).toBe(normal);
    });

    it('redacts numeric sequences of 6+ digits', () => {
      expect(redactForLogging('ID: 123456789')).not.toContain('123456789');
      expect(redactForLogging('value: 12345')).toContain('12345');
    });
  });
});
