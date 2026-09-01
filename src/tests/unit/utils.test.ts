import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, truncate, slugify } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats USD currency', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toContain('1,234.56');
    });

    it('handles zero amount', () => {
      const result = formatCurrency(0, 'USD');
      expect(result).toContain('0.00');
    });
  });

  describe('formatDate', () => {
    it('formats date string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('formats Date object', () => {
      const result = formatDate(new Date('2024-06-20'));
      expect(result).toBeDefined();
    });
  });

  describe('truncate', () => {
    it('returns original string if shorter than max', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('truncates long strings', () => {
      expect(truncate('hello world this is long', 10)).toBe('hello w...');
    });

    it('returns exact string at max length', () => {
      expect(truncate('12345', 5)).toBe('12345');
    });
  });

  describe('slugify', () => {
    it('converts text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('handles special characters', () => {
      expect(slugify('Hello! @World#')).toBe('hello-world');
    });

    it('removes leading/trailing hyphens', () => {
      expect(slugify(' Hello World ')).toBe('hello-world');
    });
  });
});
