export interface RiskScoreResult {
  score: number;
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  breakdown: Array<{ category: string; score: number; count: number }>;
}

const SEVERITY_BASE_SCORES: Record<string, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
};

function scoreToLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (score === 0) return 'safe';
  if (score <= 10) return 'low';
  if (score <= 30) return 'medium';
  if (score <= 60) return 'high';
  return 'critical';
}

export class RiskScorer {
  calculateScore(indicators: Array<{ severity: string; score?: number }>): RiskScoreResult {
    let total = 0;
    const categoryMap: Record<string, { score: number; count: number }> = {};

    for (const indicator of indicators) {
      const baseScore = indicator.score ?? SEVERITY_BASE_SCORES[indicator.severity] ?? 0;
      total += baseScore;

      if (!categoryMap[indicator.severity]) {
        categoryMap[indicator.severity] = { score: 0, count: 0 };
      }
      categoryMap[indicator.severity].score += baseScore;
      categoryMap[indicator.severity].count += 1;
    }

    const capped = Math.min(total, 100);

    const breakdown: Array<{ category: string; score: number; count: number }> = [];
    for (const [category, data] of Object.entries(categoryMap)) {
      breakdown.push({ category, score: data.score, count: data.count });
    }

    return {
      score: capped,
      level: scoreToLevel(capped),
      breakdown,
    };
  }
}

export const riskScorer = new RiskScorer();
