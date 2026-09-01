import { RuleEngine } from './rule-engine';
import { analyzeAllUssdCodes } from './ussd-analyzer';

export interface TextIndicator {
  indicator: string;
  severity: string;
  description: string;
  evidence: string;
  score?: number;
}

export interface TextAnalysisResult {
  inputType: string;
  indicators: TextIndicator[];
  patterns: string[];
  riskScore: number;
  riskLevel: string;
}

const KNOWN_BRANDS = [
  'paypal',
  'microsoft',
  'apple',
  'google',
  'amazon',
  'netflix',
  'whatsapp',
  'facebook',
  'instagram',
  'twitter',
  'linkedin',
  'hbl',
  'ubl',
  'jazzcash',
  'easypaisa',
  'bank',
  'government',
];

const EMAIL_HEADER_PATTERNS = [
  { pattern: /reply-to:\s*(.+)/i, indicator: 'REPLY_TO_HEADER', description: 'Reply-To header detected' },
  { pattern: /from:\s*(.+)/i, indicator: 'FROM_HEADER', description: 'From header detected' },
  { pattern: /x-mailer:\s*(.+)/i, indicator: 'X_MAILER_HEADER', description: 'X-Mailer header detected' },
];

export class TextAnalyzer {
  private ruleEngine: RuleEngine;

  constructor() {
    this.ruleEngine = new RuleEngine();
  }

  analyze(text: string, type: 'sms' | 'text' | 'email'): TextAnalysisResult {
    const indicators: TextIndicator[] = [];
    const patterns: string[] = [];

    const ruleMatches = this.ruleEngine.analyzeText(text);
    const triggeredMatches = ruleMatches.filter((m) => m.matched);

    for (const match of triggeredMatches) {
      indicators.push({
        indicator: match.rule.id,
        severity: match.rule.severity,
        description: match.rule.description,
        evidence: match.evidence,
        score: match.rule.score,
      });

      if (match.matchedContent) {
        patterns.push(match.matchedContent);
      }
    }

    if (type === 'email') {
      const emailIndicators = this.analyzeEmailHeaders(text);
      indicators.push(...emailIndicators);
    }

    const brandIndicators = this.checkBrandImpersonation(text);
    indicators.push(...brandIndicators);

    const scamIndicators = this.checkScamPatterns(text);
    indicators.push(...scamIndicators);

    const ussdAnalyses = analyzeAllUssdCodes(text);
    for (const ussd of ussdAnalyses) {
      const severity = ussd.risk === 'critical' ? 'critical' : ussd.risk === 'dangerous' ? 'high' : ussd.risk === 'caution' ? 'medium' : 'safe';
      indicators.push({
        indicator: `USSD_${ussd.risk.toUpperCase()}`,
        severity,
        description: `[${ussd.category}] ${ussd.description} — ${ussd.riskLevel}`,
        evidence: `Code: ${ussd.code} — ${ussd.whatItDoes}`,
        score: ussd.risk === 'critical' ? 60 : ussd.risk === 'dangerous' ? 40 : ussd.risk === 'caution' ? 15 : 0,
      });
      patterns.push(ussd.code);
    }

    const phonePatterns = text.match(/\+?\d{10,15}/g);
    if (phonePatterns) {
      for (const phone of phonePatterns) {
        patterns.push(phone);
      }
    }

    const riskScore = this.calculateRiskScore(indicators);
    const riskLevel = this.scoreToLevel(riskScore);

    return {
      inputType: type,
      indicators,
      patterns,
      riskScore,
      riskLevel,
    };
  }

  private analyzeEmailHeaders(text: string): TextIndicator[] {
    const indicators: TextIndicator[] = [];

    for (const headerPattern of EMAIL_HEADER_PATTERNS) {
      const match = text.match(headerPattern.pattern);
      if (match) {
        indicators.push({
          indicator: headerPattern.indicator,
          severity: 'low',
          description: headerPattern.description,
          evidence: match[0],
        });
      }
    }

    const fromMatch = text.match(/from:\s*(.+)/i);
    const replyToMatch = text.match(/reply-to:\s*(.+)/i);

    if (fromMatch && replyToMatch) {
      const fromEmail = this.extractEmail(fromMatch[1]);
      const replyToEmail = this.extractEmail(replyToMatch[1]);

      if (fromEmail && replyToEmail && fromEmail !== replyToEmail) {
        indicators.push({
          indicator: 'REPLY_TO_MISMATCH',
          severity: 'high',
          description: 'Reply-To address does not match From address',
          evidence: `From: ${fromEmail}, Reply-To: ${replyToEmail}`,
        });
      }
    }

    const fromLine = text.match(/from:\s*(.+)/i);
    if (fromLine) {
      const senderEmail = this.extractEmail(fromLine[1]);
      if (senderEmail) {
        const domain = senderEmail.split('@')[1];
        if (domain) {
          const suspiciousDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
          const isPersonalDomain = suspiciousDomains.includes(domain.toLowerCase());
          const claimsToBeBank = /bank|financial|official|government/i.test(text);

          if (isPersonalDomain && claimsToBeBank) {
            indicators.push({
              indicator: 'SENDER_DOMAIN_MISMATCH',
              severity: 'high',
              description: 'Sender uses personal email domain but content claims to be from a bank or official entity',
              evidence: `Sender domain: ${domain}`,
            });
          }
        }
      }
    }

    return indicators;
  }

  private extractEmail(headerValue: string): string | null {
    const emailMatch = headerValue.match(/[\w.+-]+@[\w.-]+\.\w+/);
    return emailMatch ? emailMatch[0].toLowerCase() : null;
  }

  private checkBrandImpersonation(text: string): TextIndicator[] {
    const indicators: TextIndicator[] = [];
    const lowerText = text.toLowerCase();

    for (const brand of KNOWN_BRANDS) {
      const brandRegex = new RegExp(`\\b${brand}\\b`, 'gi');
      const brandMatches = lowerText.match(brandRegex);

      if (brandMatches && brandMatches.length > 0) {
        const urgencyWords = /urgent|immediately|suspended|blocked|verify|confirm|update|secure/i;
        const hasUrgency = urgencyWords.test(text);

        if (hasUrgency) {
          indicators.push({
            indicator: `BRAND_IMPERSONATION_${brand.toUpperCase()}`,
            severity: 'high',
            description: `Possible impersonation of "${brand}" combined with urgency language`,
            evidence: `Brand "${brand}" mentioned with urgency indicators`,
          });
        }
      }
    }

    return indicators;
  }

  private checkScamPatterns(text: string): TextIndicator[] {
    const indicators: TextIndicator[] = [];

    const scamPatterns: Array<{ pattern: RegExp; severity: string; indicator: string; description: string }> = [
      { pattern: /free\s*(cash|money|grant|fund|credit)/i, severity: 'critical', indicator: 'FREE_MONEY', description: 'Offers free money — classic scam bait' },
      { pattern: /rs\.?\s*\d[\d,]*\s*(free|grant|claim|reward|prize|bonus)/i, severity: 'critical', indicator: 'CASH_PRIZE', description: 'Promises cash prize or grant' },
      { pattern: /(claim|collect|receive)\s*(your|now|immediately)\s*(cash|money|prize|reward|grant)/i, severity: 'critical', indicator: 'CLAIM_REWARD', description: 'Urges to claim a reward' },
      { pattern: /click\s*(here|below|on\s*this)/i, severity: 'high', indicator: 'CLICK_BAIT', description: 'Urges clicking a link — common in phishing' },
      { pattern: /(?:ہاں|ہیں|کلک|گرانٹ|روپے|آزادی|ءنقد|فوری| getPaid|ClaimNow|freeGrant)/i, severity: 'critical', indicator: 'URDU_SCAM_KEYWORDS', description: 'Contains Urdu/Roman Urdu scam keywords' },
      { pattern: /(?:rs\.?|pkr|rupees?)\s*(?:5000|10000|50000|100000|5[\s,]?000|10[\s,]?000|50[\s,]?000|1[\s,]?00[\s,]?000)\b/i, severity: 'high', indicator: 'SCAM_AMOUNT', description: 'Contains round rupee amounts common in scam messages' },
      { pattern: /(یوم\s*آزادی| independence[\s-]*day)/i, severity: 'high', indicator: 'HOLIDAY_LURE', description: 'References a holiday as lure for scam' },
      { pattern: /(پاکستانیوں|pakistanis|all\s*citizens|all\s*pakistani)/i, severity: 'high', indicator: 'MASS_TARGET', description: 'Targets a large group — mass scam pattern' },
      { pattern: /(نقد|cash)\s*(گرانٹ|grant)/i, severity: 'critical', indicator: 'CASH_GRANT', description: 'Cash grant offer — common government impersonation scam in Pakistan' },
      { pattern: /(فری|free).*(روپے|rupees?|pkr|rs\.)/i, severity: 'critical', indicator: 'FREE_RUPEES', description: 'Free money promise in local currency' },
    ];

    for (const { pattern, severity, indicator, description } of scamPatterns) {
      const match = text.match(pattern);
      if (match) {
        indicators.push({
          indicator,
          severity,
          description,
          evidence: `Matched: "${match[0]}"`,
        });
      }
    }

    const networkPatterns = [
      /(?:jazz|zong|telenor|ufone|warid)\s*(?:ki|se|ka|ke)?\s*(?:taraf|janib|orf)/i,
      /\*\d{3,4}#\s*(?:dial|call|mazeed|details|maloomat)/i,
      /(?:aapko|apko|aap ko)\s*\d+\s*(?:mb|gb|min|minutes|minutes?|sms)\s*(?:miley?|mile|free|muft)/i,
      /(?:mubarak ho|congratulations|badhai|bohat mubarak)/i,
      /(?:package|combo|bundle)\s*(?:activate|shuru|lagu)/i,
      /(?:free|muft|mufta)\s*(?:minutes?|sms|mb|gb|data|internet)/i,
      /(?:internet|data)\s*(?:package|bundle|offer|scheme)\s*(?:activate|chalu|shuru)/i,
      /(?:jazz|zong|telenor|ufone)\s*(?:super|superCard|monthly|weekly|daily|dinner)/i,
      /\*\d{3,4}#|\*\d{3,4}\*.*#/,
      /(?:apka|aapka|your)\s*(?:number|number pe|number ko)\s*(?:credit|balance|bonus|reward)/i,
    ];

    let isNetworkPromo = false;
    for (const pattern of networkPatterns) {
      if (pattern.test(text)) {
        isNetworkPromo = true;
        break;
      }
    }

    if (isNetworkPromo) {
      const hasSuspiciousScam = indicators.some((ind) =>
        ['critical', 'high'].includes(ind.severity) &&
        !['FREE_MONEY', 'CASH_PRIZE', 'CLAIM_REWARD', 'CLICK_BAIT', 'SCAM_AMOUNT', 'HOLIDAY_LURE', 'MASS_TARGET', 'CASH_GRANT', 'FREE_RUPEES', 'GAMBLING_SCAM', 'FAKE_REWARD', 'PROMISE_MILLIONS'].includes(ind.indicator)
      );

      if (!hasSuspiciousScam) {
        indicators.unshift({
          indicator: 'NETWORK_PROMO',
          severity: 'safe',
          description: 'Legitimate network promotional message (Jazz/Zong/Telenor/Ufone)',
          evidence: 'Detected network operator branding and promotional language patterns',
        });
      } else {
        indicators.unshift({
          indicator: 'NETWORK_IMPERSONATION',
          severity: 'high',
          description: 'May impersonate a network operator — verify through official channels',
          evidence: 'Contains network branding but also suspicious patterns',
        });
      }
    }

    return indicators;
  }

  private calculateRiskScore(indicators: TextIndicator[]): number {
    let score = 0;

    for (const indicator of indicators) {
      switch (indicator.severity) {
        case 'critical':
          score += 25;
          break;
        case 'high':
          score += 15;
          break;
        case 'medium':
          score += 8;
          break;
        case 'low':
          score += 3;
          break;
      }
    }

    return Math.min(score, 100);
  }

  private scoreToLevel(score: number): string {
    if (score === 0) return 'safe';
    if (score <= 10) return 'low';
    if (score <= 30) return 'medium';
    if (score <= 60) return 'high';
    return 'critical';
  }
}

export const textAnalyzer = new TextAnalyzer();
