import { describe, it, expect } from 'vitest';
import { validatePasswordStrength } from '@/lib/password';

describe('Password Validation', () => {
  it('accepts a strong password', () => {
    const result = validatePasswordStrength('StrongP@ss1');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = validatePasswordStrength('Ab1');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('at least 8'))).toBe(true);
  });

  it('rejects password longer than 128 characters', () => {
    const result = validatePasswordStrength('A'.repeat(129) + 'a1');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('no more than 128'))).toBe(true);
  });

  it('rejects password without lowercase', () => {
    const result = validatePasswordStrength('UPPERCASE1!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
  });

  it('rejects password without uppercase', () => {
    const result = validatePasswordStrength('lowercase1!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
  });

  it('rejects password without number', () => {
    const result = validatePasswordStrength('NoNumberHere!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('number'))).toBe(true);
  });

  it('returns multiple errors for very weak passwords', () => {
    const result = validatePasswordStrength('abc');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
