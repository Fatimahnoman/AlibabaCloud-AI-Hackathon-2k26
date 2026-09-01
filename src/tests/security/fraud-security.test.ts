import { describe, it, expect, beforeEach } from 'vitest';
import { isSafeUrl, isPrivateIP } from '@/lib/ssrf-protection';
import { redactSensitiveData, containsSensitiveData, redactForLogging } from '@/lib/credential-redaction';
import { validateFile, MAX_FILE_SIZE } from '@/lib/file-validation';
import { RuleEngine } from '@/services/fraud/rule-engine';

describe('Fraud Detection Security Tests', () => {
  describe('SSRF Protection Security', () => {
    it('blocks all dangerous URL schemes', () => {
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
      expect(isSafeUrl('data:text/html,<script>')).toBe(false);
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('ftp://example.com')).toBe(false);
      expect(isSafeUrl('jar:http://example.com/')).toBe(false);
      expect(isSafeUrl('vbscript:MsgBox')).toBe(false);
    });

    it('blocks all private IP ranges', () => {
      expect(isPrivateIP('10.0.0.1')).toBe(true);
      expect(isPrivateIP('10.255.255.255')).toBe(true);
      expect(isPrivateIP('172.16.0.1')).toBe(true);
      expect(isPrivateIP('172.31.255.255')).toBe(true);
      expect(isPrivateIP('192.168.0.1')).toBe(true);
      expect(isPrivateIP('192.168.255.255')).toBe(true);
      expect(isPrivateIP('127.0.0.1')).toBe(true);
      expect(isPrivateIP('127.255.255.255')).toBe(true);
      expect(isPrivateIP('169.254.0.1')).toBe(true);
      expect(isPrivateIP('169.254.169.254')).toBe(true);
    });

    it('blocks cloud metadata endpoints', () => {
      expect(isSafeUrl('http://169.254.169.254/latest/meta-data/')).toBe(false);
      expect(isSafeUrl('http://169.254.169.254/latest/meta-data/iam/security-credentials/')).toBe(false);
      expect(isSafeUrl('http://metadata.google.internal/')).toBe(false);
      expect(isSafeUrl('http://0.metadata.google.internal/')).toBe(false);
    });

    it('blocks localhost variants', () => {
      expect(isSafeUrl('http://localhost')).toBe(false);
      expect(isSafeUrl('https://localhost:3000')).toBe(false);
      expect(isSafeUrl('http://127.0.0.1')).toBe(false);
      expect(isSafeUrl('http://0.0.0.0')).toBe(false);
      expect(isPrivateIP('::1')).toBe(true);
    });

    it('allows legitimate public URLs', () => {
      expect(isSafeUrl('https://google.com')).toBe(true);
      expect(isSafeUrl('https://example.com')).toBe(true);
      expect(isSafeUrl('https://github.com/repo')).toBe(true);
      expect(isSafeUrl('https://api.openai.com/v1/models')).toBe(true);
    });

    it('public IPs are not flagged as private', () => {
      expect(isPrivateIP('8.8.8.8')).toBe(false);
      expect(isPrivateIP('1.1.1.1')).toBe(false);
      expect(isPrivateIP('104.16.0.1')).toBe(false);
    });
  });

  describe('Credential Redaction Security', () => {
    it('redacts OTP patterns', () => {
      expect(redactSensitiveData('OTP 483921')).toBe('[REDACTED]');
      expect(redactSensitiveData('Your OTP is 123456')).toBe('Your [REDACTED]');
    });

    it('redacts credit card numbers', () => {
      expect(redactSensitiveData('4111 1111 1111 1111')).toBe('[REDACTED]');
      expect(redactSensitiveData('Card: 4111-1111-1111-1111')).toContain('[REDACTED]');
    });

    it('redacts CVV patterns', () => {
      expect(redactSensitiveData('CVV: 123')).toBe('[REDACTED]');
      expect(redactSensitiveData('cvv=4567')).toBe('[REDACTED]');
    });

    it('redacts password patterns', () => {
      expect(redactSensitiveData('password: secret123')).toBe('password: [REDACTED]');
      expect(redactSensitiveData('pwd=hunter2')).toBe('pwd= [REDACTED]');
    });

    it('redacts PIN patterns', () => {
      const result = containsSensitiveData('PIN: 1234');
      expect(result.hasSensitive).toBe(true);
      expect(result.types).toContain('pin');
    });

    it('detects all sensitive data types', () => {
      const types = ['otp', 'pin', 'cvv', 'password', 'card_number'];
      const inputs: Record<string, string> = {
        otp: 'OTP 483921',
        pin: 'PIN: 1234',
        cvv: 'CVV: 123',
        password: 'password: secret',
        card_number: '4111 1111 1111 1111',
      };

      for (const type of types) {
        const result = containsSensitiveData(inputs[type]);
        expect(result.hasSensitive).toBe(true);
        expect(result.types).toContain(type);
      }
    });

    it('redactForLogging handles edge cases', () => {
      expect(redactForLogging('')).toBe('');
      expect(redactForLogging('No secrets here')).toBe('No secrets here');
      expect(redactForLogging('ID: 123456789012')).not.toContain('123456789012');
    });
  });

  describe('File Validation Security', () => {
    it('rejects oversized files', () => {
      const result = validateFile({
        name: 'huge.pdf',
        size: MAX_FILE_SIZE + 1,
        type: 'application/pdf',
      });
      expect(result.valid).toBe(false);
    });

    it('rejects executable files', () => {
      expect(
        validateFile({ name: 'malware.exe', size: 1024, type: 'application/x-msdownload' }).valid
      ).toBe(false);
      expect(
        validateFile({ name: 'script.bat', size: 1024, type: 'application/x-bat' }).valid
      ).toBe(false);
      expect(
        validateFile({ name: 'binary.com', size: 1024, type: 'application/x-msdownload' }).valid
      ).toBe(false);
    });

    it('rejects empty files', () => {
      expect(
        validateFile({ name: 'empty.pdf', size: 0, type: 'application/pdf' }).valid
      ).toBe(false);
    });

    it('rejects files with no extension', () => {
      expect(
        validateFile({ name: 'noext', size: 1024, type: 'application/pdf' }).valid
      ).toBe(false);
    });

    it('rejects JavaScript files', () => {
      expect(
        validateFile({ name: 'malicious.js', size: 1024, type: 'text/javascript' }).valid
      ).toBe(false);
    });

    it('rejects HTML files', () => {
      expect(
        validateFile({ name: 'page.html', size: 1024, type: 'text/html' }).valid
      ).toBe(false);
    });

    it('accepts valid documents', () => {
      expect(
        validateFile({ name: 'report.pdf', size: 1024, type: 'application/pdf' }).valid
      ).toBe(true);
      expect(
        validateFile({ name: 'photo.png', size: 1024, type: 'image/png' }).valid
      ).toBe(true);
      expect(
        validateFile({ name: 'doc.docx', size: 1024, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }).valid
      ).toBe(true);
    });
  });

  describe('Rule Engine Robustness', () => {
    let engine: RuleEngine;

    beforeEach(() => {
      engine = new RuleEngine();
    });

    it("doesn't crash on empty input", () => {
      expect(() => engine.analyzeText('')).not.toThrow();
      expect(() => engine.analyzeUrl('')).not.toThrow();
      const result = engine.analyzeText('');
      expect(Array.isArray(result)).toBe(true);
    });

    it("doesn't crash on very long input (>10000 chars)", () => {
      const longText = 'a'.repeat(10001);
      expect(() => engine.analyzeText(longText)).not.toThrow();
      const result = engine.analyzeText(longText);
      expect(Array.isArray(result)).toBe(true);
    });

    it("doesn't crash on special characters", () => {
      expect(() => engine.analyzeText('\\n\\t\\r\\0')).not.toThrow();
      expect(() => engine.analyzeText('<script>alert(1)</script>')).not.toThrow();
      expect(() => engine.analyzeText('{"key": "value"}')).not.toThrow();
    });

    it("doesn't crash on very long URLs", () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(10001);
      expect(() => engine.analyzeUrl(longUrl)).not.toThrow();
    });

    it('returns consistent results for same input', () => {
      const text = 'Please send OTP immediately';
      const result1 = engine.analyzeText(text);
      const result2 = engine.analyzeText(text);
      expect(result1).toEqual(result2);
    });

    it('handles Unicode and emoji input gracefully', () => {
      expect(() => engine.analyzeText('Hello 🌍 وعلیکم السلام')).not.toThrow();
      const result = engine.analyzeText('Hello 🌍');
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles input with null bytes', () => {
      expect(() => engine.analyzeText('test\0input')).not.toThrow();
    });

    it('handles input with regex metacharacters', () => {
      expect(() => engine.analyzeText('[a-z]+ (.*?) \\d+')).not.toThrow();
      expect(() => engine.analyzeText('^$.*+?{}[]|()')).not.toThrow();
    });
  });
});
