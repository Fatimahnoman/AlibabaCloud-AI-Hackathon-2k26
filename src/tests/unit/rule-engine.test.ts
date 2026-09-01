import { describe, it, expect, beforeEach } from 'vitest';
import { RuleEngine, FraudRule } from '@/services/fraud/rule-engine';

describe('Rule Engine', () => {
  let engine: RuleEngine;

  beforeEach(() => {
    engine = new RuleEngine();
  });

  describe('analyzeText', () => {
    it('detects OTP request patterns', () => {
      const matches = engine.analyzeText('Please send me the OTP');
      const otpMatch = matches.find(
        (m) => m.rule.id === 'OTP_REQUEST' && m.matched
      );
      expect(otpMatch).toBeDefined();
      expect(otpMatch!.matched).toBe(true);
    });

    it('detects urgency patterns', () => {
      const matches = engine.analyzeText('This is urgent, act now!');
      const urgencyMatch = matches.find(
        (m) => m.rule.id === 'URGENCY' && m.matched
      );
      expect(urgencyMatch).toBeDefined();
      expect(urgencyMatch!.matched).toBe(true);
    });

    it('detects prize scam patterns', () => {
      const matches = engine.analyzeText('Congratulations you won a prize');
      const prizeMatch = matches.find(
        (m) => m.rule.id === 'PRIZE_SCAM' && m.matched
      );
      expect(prizeMatch).toBeDefined();
      expect(prizeMatch!.matched).toBe(true);
    });

    it('detects account suspension patterns', () => {
      const matches = engine.analyzeText(
        'Your account will be blocked immediately'
      );
      const suspendMatch = matches.find(
        (m) => m.rule.id === 'ACCOUNT_SUSPENSION' && m.matched
      );
      expect(suspendMatch).toBeDefined();
      expect(suspendMatch!.matched).toBe(true);
    });

    it('detects password request patterns', () => {
      const matches = engine.analyzeText('Please share your password');
      const pwdMatch = matches.find(
        (m) => m.rule.id === 'PASSWORD_REQUEST' && m.matched
      );
      expect(pwdMatch).toBeDefined();
      expect(pwdMatch!.matched).toBe(true);
    });

    it('returns no matches for normal text', () => {
      const matches = engine.analyzeText(
        'The weather is nice today and I went for a walk'
      );
      const anyMatched = matches.some((m) => m.matched);
      expect(anyMatched).toBe(false);
    });

    it('returns results for every enabled rule', () => {
      const matches = engine.analyzeText('normal text');
      expect(matches.length).toBeGreaterThan(0);
    });

    it('handles empty string', () => {
      const matches = engine.analyzeText('');
      expect(Array.isArray(matches)).toBe(true);
    });

    it('detects threat language', () => {
      const matches = engine.analyzeText(
        'Your account will be suspended by police'
      );
      const threatMatch = matches.find(
        (m) => m.rule.id === 'THREAT' && m.matched
      );
      expect(threatMatch).toBeDefined();
    });

    it('detects investment scams', () => {
      const matches = engine.analyzeText(
        'This guaranteed return investment opportunity is risk free'
      );
      const investmentMatch = matches.find(
        (m) => m.rule.id === 'INVESTMENT_SCAM' && m.matched
      );
      expect(investmentMatch).toBeDefined();
    });
  });

  describe('analyzeUrl', () => {
    it('detects URL shorteners', () => {
      const matches = engine.analyzeUrl('https://bit.ly/abc123');
      const shortenerMatch = matches.find(
        (m) => m.rule.id === 'URL_SHORTENER' && m.matched
      );
      expect(shortenerMatch).toBeDefined();
      expect(shortenerMatch!.matched).toBe(true);
    });

    it('detects suspicious TLDs', () => {
      const matches = engine.analyzeUrl('https://malware.xyz/download');
      const tldMatch = matches.find(
        (m) => m.rule.id === 'SUSPICIOUS_TLD' && m.matched
      );
      expect(tldMatch).toBeDefined();
      expect(tldMatch!.matched).toBe(true);
    });

    it('detects lookalike domains', () => {
      const matches = engine.analyzeUrl('https://paypa1-secure.com/login');
      const lookalikeMatch = matches.find(
        (m) => m.rule.id === 'LOOKALIKE' && m.matched
      );
      expect(lookalikeMatch).toBeDefined();
      expect(lookalikeMatch!.matched).toBe(true);
    });

    it('only returns url and domain type rules', () => {
      const matches = engine.analyzeUrl('https://example.com');
      for (const match of matches) {
        expect(['url', 'domain']).toContain(match.rule.ruleType);
      }
    });
  });

  describe('getRules', () => {
    it('returns all default rules (at least 25)', () => {
      const rules = engine.getRules();
      expect(rules.length).toBeGreaterThanOrEqual(25);
    });

    it('returns a copy (not the internal array)', () => {
      const rules1 = engine.getRules();
      const rules2 = engine.getRules();
      expect(rules1).not.toBe(rules2);
      expect(rules1).toEqual(rules2);
    });

    it('each rule has required fields', () => {
      const rules = engine.getRules();
      for (const rule of rules) {
        expect(rule.id).toBeTruthy();
        expect(rule.name).toBeTruthy();
        expect(rule.pattern).toBeTruthy();
        expect(['low', 'medium', 'high', 'critical']).toContain(rule.severity);
        expect(rule.score).toBeGreaterThan(0);
        expect(typeof rule.enabled).toBe('boolean');
      }
    });
  });

  describe('addRule', () => {
    it('adds a custom rule', () => {
      const customRule: FraudRule = {
        id: 'CUSTOM_TEST',
        name: 'Custom Test Rule',
        ruleType: 'keyword',
        pattern: 'custom.*pattern',
        severity: 'low',
        score: 5,
        enabled: true,
        description: 'A test rule',
      };

      engine.addRule(customRule);
      const rules = engine.getRules();
      const found = rules.find((r) => r.id === 'CUSTOM_TEST');
      expect(found).toBeDefined();
      expect(found!.name).toBe('Custom Test Rule');
    });

    it('custom rule can match text', () => {
      const customRule: FraudRule = {
        id: 'CUSTOM_DETECT',
        name: 'Custom Detection',
        ruleType: 'keyword',
        pattern: 'foobar',
        severity: 'low',
        score: 5,
        enabled: true,
        description: 'Detects foobar',
      };

      engine.addRule(customRule);
      const matches = engine.analyzeText('This text contains foobar word');
      const customMatch = matches.find(
        (m) => m.rule.id === 'CUSTOM_DETECT' && m.matched
      );
      expect(customMatch).toBeDefined();
    });

    it('replaces existing rule with same id', () => {
      const rule1: FraudRule = {
        id: 'REPLACE_TEST',
        name: 'Original',
        ruleType: 'keyword',
        pattern: 'original_pattern',
        severity: 'low',
        score: 5,
        enabled: true,
        description: 'Original',
      };
      const rule2: FraudRule = {
        id: 'REPLACE_TEST',
        name: 'Replaced',
        ruleType: 'keyword',
        pattern: 'replaced_pattern',
        severity: 'high',
        score: 20,
        enabled: true,
        description: 'Replaced',
      };

      engine.addRule(rule1);
      engine.addRule(rule2);
      const rules = engine.getRules();
      const occurrences = rules.filter((r) => r.id === 'REPLACE_TEST');
      expect(occurrences).toHaveLength(1);
      expect(occurrences[0].name).toBe('Replaced');
    });
  });

  describe('multiple rules', () => {
    it('multiple rules can match same text', () => {
      const matches = engine.analyzeText(
        'Urgent: send OTP immediately or account will be blocked'
      );
      const matchedRules = matches.filter((m) => m.matched);
      expect(matchedRules.length).toBeGreaterThanOrEqual(2);

      const matchedIds = matchedRules.map((m) => m.rule.id);
      expect(matchedIds).toContain('OTP_REQUEST');
      expect(matchedIds).toContain('URGENCY');
    });
  });
});
