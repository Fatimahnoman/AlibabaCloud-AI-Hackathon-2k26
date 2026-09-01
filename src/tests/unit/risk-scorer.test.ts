import { describe, it, expect, beforeEach } from 'vitest';
import { RiskScorer } from '@/services/fraud/risk-scorer';

describe('Risk Scorer', () => {
  let scorer: RiskScorer;

  beforeEach(() => {
    scorer = new RiskScorer();
  });

  describe('calculateScore', () => {
    it("returns 'safe' for 0 indicators", () => {
      const result = scorer.calculateScore([]);
      expect(result.score).toBe(0);
      expect(result.level).toBe('safe');
    });

    it("returns 'low' for low-severity indicators (score 1-10)", () => {
      const result = scorer.calculateScore([
        { severity: 'low' },
        { severity: 'low' },
      ]);
      expect(result.score).toBe(6);
      expect(result.level).toBe('low');
    });

    it("returns 'medium' for medium indicators (score 11-30)", () => {
      const result = scorer.calculateScore([
        { severity: 'medium' },
        { severity: 'medium' },
        { severity: 'medium' },
      ]);
      expect(result.score).toBe(24);
      expect(result.level).toBe('medium');
    });

    it("returns 'high' for high indicators (score 31-60)", () => {
      const result = scorer.calculateScore([
        { severity: 'high' },
        { severity: 'high' },
        { severity: 'high' },
      ]);
      expect(result.score).toBe(45);
      expect(result.level).toBe('high');
    });

    it("returns 'critical' for many high indicators (score 61+)", () => {
      const result = scorer.calculateScore([
        { severity: 'high' },
        { severity: 'high' },
        { severity: 'high' },
        { severity: 'high' },
        { severity: 'high' },
      ]);
      expect(result.score).toBe(75);
      expect(result.level).toBe('critical');
    });

    it("returns 'critical' for critical indicators (score 81-100)", () => {
      const result = scorer.calculateScore([
        { severity: 'critical' },
        { severity: 'critical' },
        { severity: 'critical' },
        { severity: 'critical' },
      ]);
      expect(result.score).toBeGreaterThanOrEqual(81);
      expect(result.level).toBe('critical');
    });

    it('caps score at 100', () => {
      const result = scorer.calculateScore([
        { severity: 'critical' },
        { severity: 'critical' },
        { severity: 'critical' },
        { severity: 'critical' },
        { severity: 'critical' },
      ]);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('provides breakdown by severity category', () => {
      const result = scorer.calculateScore([
        { severity: 'high' },
        { severity: 'high' },
        { severity: 'medium' },
        { severity: 'low' },
      ]);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.length).toBeGreaterThan(0);

      const highCategory = result.breakdown.find(
        (b) => b.category === 'high'
      );
      expect(highCategory).toBeDefined();
      expect(highCategory!.count).toBe(2);
      expect(highCategory!.score).toBe(30);

      const mediumCategory = result.breakdown.find(
        (b) => b.category === 'medium'
      );
      expect(mediumCategory).toBeDefined();
      expect(mediumCategory!.count).toBe(1);

      const lowCategory = result.breakdown.find(
        (b) => b.category === 'low'
      );
      expect(lowCategory).toBeDefined();
      expect(lowCategory!.count).toBe(1);
    });

    it('uses custom score when provided', () => {
      const result = scorer.calculateScore([{ severity: 'low', score: 50 }]);
      expect(result.score).toBe(50);
    });

    it('returns empty breakdown for no indicators', () => {
      const result = scorer.calculateScore([]);
      expect(result.breakdown).toHaveLength(0);
    });

    it('correctly accumulates multiple indicators of same severity', () => {
      const result = scorer.calculateScore([
        { severity: 'medium' },
        { severity: 'medium' },
        { severity: 'medium' },
        { severity: 'medium' },
        { severity: 'medium' },
      ]);
      const mediumCat = result.breakdown.find(
        (b) => b.category === 'medium'
      );
      expect(mediumCat!.count).toBe(5);
      expect(mediumCat!.score).toBe(40);
    });

    it('returns correct boundary: single critical is medium', () => {
      const result = scorer.calculateScore([
        { severity: 'critical' },
      ]);
      expect(result.score).toBe(25);
      expect(result.level).toBe('medium');
    });

    it('returns correct boundary: single low is low', () => {
      const result = scorer.calculateScore([{ severity: 'low' }]);
      expect(result.score).toBe(3);
      expect(result.level).toBe('low');
    });
  });
});
