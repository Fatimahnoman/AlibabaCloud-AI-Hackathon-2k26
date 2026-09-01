import { describe, it, expect } from 'vitest';
import {
  isSafeUrl,
  isPrivateIP,
  validateRedirectUrl,
  BLOCKED_HOSTNAMES,
} from '@/lib/ssrf-protection';

describe('SSRF Protection', () => {
  describe('isSafeUrl', () => {
    it('blocks file:// URLs', () => {
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
      expect(isSafeUrl('file:///C:/Windows/System32/config/sam')).toBe(false);
    });

    it('blocks data: URLs', () => {
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('data:image/png;base64,AAAA')).toBe(false);
    });

    it('blocks javascript: URLs', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('javascript:void(0)')).toBe(false);
    });

    it('blocks localhost', () => {
      expect(isSafeUrl('http://localhost')).toBe(false);
      expect(isSafeUrl('https://localhost:3000/api')).toBe(false);
    });

    it('blocks 127.0.0.1', () => {
      expect(isSafeUrl('http://127.0.0.1')).toBe(false);
      expect(isSafeUrl('https://127.0.0.1:8080/admin')).toBe(false);
    });

    it('blocks 0.0.0.0', () => {
      expect(isSafeUrl('http://0.0.0.0')).toBe(false);
      expect(isSafeUrl('https://0.0.0.0/sensitive')).toBe(false);
    });

    it('blocks 169.254.169.254 (cloud metadata)', () => {
      expect(isSafeUrl('http://169.254.169.254/latest/meta-data/')).toBe(false);
      expect(isSafeUrl('https://169.254.169.254/latest/meta-data/iam/security-credentials/')).toBe(false);
    });

    it('allows https://google.com', () => {
      expect(isSafeUrl('https://google.com')).toBe(true);
    });

    it('allows https://example.com', () => {
      expect(isSafeUrl('https://example.com')).toBe(true);
      expect(isSafeUrl('https://example.com/path?q=1')).toBe(true);
    });

    it('allows http:// URLs to public hosts', () => {
      expect(isSafeUrl('http://google.com')).toBe(true);
      expect(isSafeUrl('http://example.com')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(isSafeUrl('not-a-url')).toBe(false);
      expect(isSafeUrl('')).toBe(false);
    });

    it('blocks IPv6 loopback via isPrivateIP', () => {
      expect(isPrivateIP('::1')).toBe(true);
    });

    it('blocks metadata.google.internal', () => {
      expect(isSafeUrl('http://metadata.google.internal/')).toBe(false);
    });
  });

  describe('isPrivateIP', () => {
    it('detects 10.x.x.x addresses', () => {
      expect(isPrivateIP('10.0.0.1')).toBe(true);
      expect(isPrivateIP('10.255.255.255')).toBe(true);
      expect(isPrivateIP('10.1.2.3')).toBe(true);
    });

    it('detects 192.168.x.x addresses', () => {
      expect(isPrivateIP('192.168.0.1')).toBe(true);
      expect(isPrivateIP('192.168.1.1')).toBe(true);
      expect(isPrivateIP('192.168.255.255')).toBe(true);
    });

    it('detects 172.16-31.x.x addresses', () => {
      expect(isPrivateIP('172.16.0.1')).toBe(true);
      expect(isPrivateIP('172.31.255.255')).toBe(true);
      expect(isPrivateIP('172.20.10.5')).toBe(true);
    });

    it('returns false for public IPs', () => {
      expect(isPrivateIP('8.8.8.8')).toBe(false);
      expect(isPrivateIP('1.1.1.1')).toBe(false);
      expect(isPrivateIP('203.0.113.1')).toBe(false);
      expect(isPrivateIP('198.51.100.1')).toBe(false);
    });

    it('detects 127.x.x.x loopback', () => {
      expect(isPrivateIP('127.0.0.1')).toBe(true);
      expect(isPrivateIP('127.255.255.255')).toBe(true);
    });

    it('detects 169.254.x.x link-local', () => {
      expect(isPrivateIP('169.254.169.254')).toBe(true);
      expect(isPrivateIP('169.254.0.1')).toBe(true);
    });

    it('detects 0.0.0.0', () => {
      expect(isPrivateIP('0.0.0.0')).toBe(true);
    });

    it('detects IPv6 loopback ::1', () => {
      expect(isPrivateIP('::1')).toBe(true);
    });

    it('returns false for non-IP strings', () => {
      expect(isPrivateIP('example.com')).toBe(false);
      expect(isPrivateIP('localhost')).toBe(false);
    });

    it('returns false for 172.32.x.x (outside private range)', () => {
      expect(isPrivateIP('172.32.0.1')).toBe(false);
      expect(isPrivateIP('172.15.0.1')).toBe(false);
    });
  });

  describe('validateRedirectUrl', () => {
    it('allows same-domain redirects', () => {
      expect(
        validateRedirectUrl('https://example.com/new-page', 'https://example.com/old-page')
      ).toBe(true);
    });

    it('allows subdomain redirects of the same registrable domain', () => {
      expect(
        validateRedirectUrl('https://sub.example.com/page', 'https://example.com/page')
      ).toBe(true);
    });

    it('blocks cross-domain redirects', () => {
      expect(
        validateRedirectUrl('https://evil.com/steal', 'https://example.com/page')
      ).toBe(false);
    });

    it('blocks redirects to private IPs', () => {
      expect(
        validateRedirectUrl('http://192.168.1.1/admin', 'https://example.com/page')
      ).toBe(false);
      expect(
        validateRedirectUrl('http://10.0.0.1/secret', 'https://example.com/page')
      ).toBe(false);
    });

    it('blocks redirects to localhost', () => {
      expect(
        validateRedirectUrl('http://localhost:3000/admin', 'https://example.com/page')
      ).toBe(false);
    });

    it('blocks non-http/https protocols', () => {
      expect(
        validateRedirectUrl('ftp://example.com/file', 'https://example.com/page')
      ).toBe(false);
    });

    it('returns false for invalid redirect URLs', () => {
      expect(validateRedirectUrl('not-a-url', 'https://example.com/page')).toBe(false);
    });

    it('returns false for invalid original URLs', () => {
      expect(validateRedirectUrl('https://example.com/page', 'not-a-url')).toBe(false);
    });

    it('blocks redirects to 169.254.169.254', () => {
      expect(
        validateRedirectUrl('http://169.254.169.254/latest/meta-data/', 'https://example.com/')
      ).toBe(false);
    });
  });
});
