import { describe, it, expect } from 'vitest';
import { UrlAnalyzer } from '@/services/fraud/url-analyzer';
import { TextAnalyzer } from '@/services/fraud/text-analyzer';
import { RiskScorer } from '@/services/fraud/risk-scorer';
import { RuleEngine } from '@/services/fraud/rule-engine';
import { analyzeUssdCode, extractUssdCodes, analyzeAllUssdCodes } from '@/services/fraud/ussd-analyzer';
import { analyzePhoneNumber } from '@/services/fraud/phone-analyzer';
import { DocumentProcessor } from '@/services/fraud/document-processor';
import { getComplaintPathForIndicators, getComplaintPathForType, complaintPaths } from '@/services/fraud/complaint-paths';
import { getContextForIndicators, scamStats2025, scamTrends } from '@/services/fraud/scam-knowledge-base';

// ─── URL Analyzer ────────────────────────────────────────────────
describe('URL Analyzer', () => {
  const analyzer = new UrlAnalyzer();

  describe('parseUrl', () => {
    it('extracts domain, subdomain, and TLD correctly', () => {
      const result = analyzer.parseUrl('https://www.example.com/path');
      expect(result.domain).toBe('example');
      expect(result.subdomain).toBe('www');
      expect(result.tld).toBe('com');
    });

    it('handles URLs without subdomain', () => {
      const result = analyzer.parseUrl('https://example.com');
      expect(result.domain).toBe('example');
      expect(result.subdomain).toBe('');
      expect(result.tld).toBe('com');
    });

    it('handles multi-level subdomains', () => {
      const result = analyzer.parseUrl('https://a.b.example.com');
      expect(result.domain).toBe('example');
      expect(result.subdomain).toBe('a.b');
    });

    it('returns empty for invalid URL', () => {
      const result = analyzer.parseUrl('not-a-url');
      expect(result.domain).toBe('');
      expect(result.tld).toBe('');
    });
  });

  describe('checkLookalikeDomain', () => {
    it('detects typosquatting for PayPal', () => {
      const indicators = analyzer.checkLookalikeDomain('paypa1');
      expect(indicators.length).toBeGreaterThan(0);
      expect(indicators[0].indicator).toBe('TYPOSQUAT_DOMAIN');
      expect(indicators[0].severity).toBe('critical');
    });

    it('detects lookalike for Microsoft', () => {
      const indicators = analyzer.checkLookalikeDomain('micros0ft');
      expect(indicators.length).toBeGreaterThan(0);
      expect(indicators.some(i => i.indicator === 'TYPOSQUAT_DOMAIN')).toBe(true);
    });

    it('detects HBL lookalike', () => {
      const indicators = analyzer.checkLookalikeDomain('hbl-verify');
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('does not flag legitimate brand domains', () => {
      const indicators = analyzer.checkLookalikeDomain('paypal');
      expect(indicators.length).toBe(0);
    });

    it('detects brand name embedded in domain', () => {
      const indicators = analyzer.checkLookalikeDomain('paypal-security');
      expect(indicators.length).toBeGreaterThan(0);
    });
  });

  describe('checkUrlShortener', () => {
    it('detects bit.ly', () => {
      const result = analyzer.checkUrlShortener('https://bit.ly/abc123');
      expect(result).not.toBeNull();
      expect(result!.indicator).toBe('URL_SHORTENER');
    });

    it('detects tinyurl.com', () => {
      const result = analyzer.checkUrlShortener('https://tinyurl.com/xyz');
      expect(result).not.toBeNull();
    });

    it('returns null for normal URLs', () => {
      const result = analyzer.checkUrlShortener('https://google.com/search');
      expect(result).toBeNull();
    });
  });

  describe('checkScamKeywords', () => {
    it('detects "prize" as critical', () => {
      const indicators = analyzer.checkScamKeywords('https://win-prize-now.xyz');
      expect(indicators.length).toBeGreaterThan(0);
      expect(indicators.some(i => i.severity === 'critical')).toBe(true);
    });

    it('detects "lottery" as critical', () => {
      const indicators = analyzer.checkScamKeywords('https://lottery-winner.com');
      expect(indicators.some(i => i.severity === 'critical')).toBe(true);
    });

    it('detects "verify-account" as high', () => {
      const indicators = analyzer.checkScamKeywords('https://bank-verify-account.com');
      expect(indicators.some(i => i.description.includes('verify-account'))).toBe(true);
    });

    it('detects Pakistani scam patterns', () => {
      const indicators = analyzer.checkScamKeywords('https://rs5000-free.com');
      expect(indicators.some(i => i.description.includes('rs5000'))).toBe(true);
    });

    it('returns empty for clean URLs', () => {
      const indicators = analyzer.checkScamKeywords('https://google.com/search?q=hello');
      expect(indicators.length).toBe(0);
    });
  });

  describe('checkSuspiciousTld', () => {
    it('flags .xyz as suspicious', () => {
      const result = analyzer.checkSuspiciousTld('xyz');
      expect(result).not.toBeNull();
      expect(result!.indicator).toBe('SUSPICIOUS_TLD');
    });

    it('flags .tk as suspicious', () => {
      const result = analyzer.checkSuspiciousTld('tk');
      expect(result).not.toBeNull();
    });

    it('does not flag .com', () => {
      const result = analyzer.checkSuspiciousTld('com');
      expect(result).toBeNull();
    });

    it('does not flag .org', () => {
      const result = analyzer.checkSuspiciousTld('org');
      expect(result).toBeNull();
    });
  });

  describe('calculateRiskScore', () => {
    it('returns 0 for no indicators', () => {
      expect(analyzer.calculateRiskScore([])).toBe(0);
    });

    it('caps at 100', () => {
      const indicators = Array(10).fill(null).map(() => ({ indicator: 'TEST', severity: 'critical' as const, description: '' }));
      expect(analyzer.calculateRiskScore(indicators)).toBe(100);
    });

    it('scores critical at 25 each', () => {
      const score = analyzer.calculateRiskScore([{ indicator: 'X', severity: 'critical', description: '' }]);
      expect(score).toBe(25);
    });

    it('scores high at 15 each', () => {
      const score = analyzer.calculateRiskScore([{ indicator: 'X', severity: 'high', description: '' }]);
      expect(score).toBe(15);
    });
  });

  describe('analyzeUrl (full analysis)', () => {
    it('handles malformed URL gracefully', async () => {
      const result = await analyzer.analyzeUrl('not-a-url');
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.indicators.some(i => i.indicator === 'INVALID_URL')).toBe(true);
    });

    it('detects HTTP (no HTTPS) as medium risk', async () => {
      const result = await analyzer.analyzeUrl('http://example.com');
      expect(result.isHttps).toBe(false);
      expect(result.indicators.some(i => i.indicator === 'NO_HTTPS')).toBe(true);
    });

    it('detects IP address URLs', async () => {
      const result = await analyzer.analyzeUrl('http://192.168.1.1/login');
      expect(result.indicators.some(i => i.indicator === 'IP_ADDRESS_URL')).toBe(true);
    });

    it('detects unusual ports', async () => {
      const result = await analyzer.analyzeUrl('https://example.com:8080/path');
      expect(result.indicators.some(i => i.indicator === 'UNUSUAL_PORT')).toBe(true);
    });

    it('detects @ symbol in URL path', async () => {
      const result = await analyzer.analyzeUrl('https://example.com/@evil/redirect');
      expect(result.indicators.some(i => i.indicator === 'OBfuscated_URL')).toBe(true);
    });

    it('detects blocked hosts', async () => {
      const result = await analyzer.analyzeUrl('http://169.254.169.254/latest/meta-data');
      expect(result.indicators.some(i => i.indicator === 'BLOCKED_HOST')).toBe(true);
    });
  });
});

// ─── Text Analyzer ───────────────────────────────────────────────
describe('Text Analyzer', () => {
  const analyzer = new TextAnalyzer();

  describe('SMS scam detection', () => {
    it('detects OTP theft attempt', () => {
      const result = analyzer.analyze('Please send your OTP code immediately to verify your account', 'sms');
      expect(result.indicators.some(i => i.indicator === 'OTP_REQUEST')).toBe(true);
      expect(result.riskScore).toBeGreaterThan(0);
    });

    it('detects prize scam', () => {
      const result = analyzer.analyze('Congratulations! You have won Rs 500,000 in our lottery. Claim now!', 'sms');
      expect(result.indicators.some(i => i.indicator === 'PRIZE_SCAM' || i.indicator === 'CASH_PRIZE')).toBe(true);
      expect(result.riskScore).toBeGreaterThan(20);
    });

    it('detects free money scam', () => {
      const result = analyzer.analyze('Get free cash now! Send your details to claim your free money grant', 'sms');
      expect(result.indicators.some(i => i.indicator === 'FREE_MONEY')).toBe(true);
    });

    it('detects urgency pressure', () => {
      const result = analyzer.analyze('URGENT: Your account will be blocked immediately. Act now to verify.', 'sms');
      expect(result.indicators.some(i => i.indicator === 'URGENCY')).toBe(true);
    });

    it('detects investment scam', () => {
      const result = analyzer.analyze('Guaranteed return on investment! Double your money in 30 days. Risk free opportunity.', 'sms');
      expect(result.indicators.some(i => i.indicator === 'INVESTMENT_SCAM')).toBe(true);
    });

    it('detects gambling scam', () => {
      const result = analyzer.analyze('Spin and win cash! Lucky draw jackpot! Deposit bonus and bet to win big!', 'sms');
      expect(result.indicators.some(i => i.indicator === 'GAMBLING_SCAM')).toBe(true);
    });
  });

  describe('Email phishing detection', () => {
    it('detects sender domain mismatch', () => {
      const email = `From: HBL Bank <support@gmail.com>\nReply-To: hacker@yahoo.com\nYour HBL account will be suspended. Verify your password immediately.`;
      const result = analyzer.analyze(email, 'email');
      expect(result.indicators.some(i => i.indicator === 'REPLY_TO_MISMATCH')).toBe(true);
      expect(result.indicators.some(i => i.indicator === 'SENDER_DOMAIN_MISMATCH')).toBe(true);
    });

    it('detects personal email claiming to be bank', () => {
      const email = `From: security@hotmail.com\nYour bank account needs verification. Update your information now.`;
      const result = analyzer.analyze(email, 'email');
      expect(result.indicators.some(i => i.indicator === 'SENDER_DOMAIN_MISMATCH')).toBe(true);
    });
  });

  describe('Brand impersonation', () => {
    it('detects JazzCash impersonation with urgency', () => {
      const result = analyzer.analyze('JazzCash: Your account has been suspended. Verify immediately or your account will be blocked.', 'sms');
      expect(result.indicators.some(i => i.indicator.includes('BRAND_IMPERSONATION'))).toBe(true);
    });

    it('detects EasyPaisa impersonation', () => {
      const result = analyzer.analyze('EasyPaisa: Urgent update required. Confirm your identity now.', 'sms');
      expect(result.indicators.some(i => i.indicator.includes('BRAND_IMPERSONATION'))).toBe(true);
    });
  });

  describe('Urdu/Roman Urdu scam detection', () => {
    it('detects Urdu scam keywords', () => {
      const result = analyzer.analyze('آپ کو 5000 روپے فری گرانٹ ملے گی فوری کلک کریں', 'sms');
      expect(result.indicators.some(i => i.indicator === 'URDU_SCAM_KEYWORDS' || i.indicator === 'CASH_GRANT' || i.indicator === 'FREE_RUPEES')).toBe(true);
    });

    it('detects Roman Urdu scam patterns', () => {
      const result = analyzer.analyze('apko Rs 10000 free miley, abhi claim karein', 'sms');
      expect(result.riskScore).toBeGreaterThan(0);
    });
  });

  describe('Network promo detection (avoid false positives)', () => {
    it('identifies legitimate Jazz promo', () => {
      const result = analyzer.analyze('Jazz ki taraf se mubarak ho! Aapko 5GB data mila. Dial *111# for details.', 'sms');
      expect(result.indicators.some(i => i.indicator === 'NETWORK_PROMO')).toBe(true);
    });

    it('flags impersonation when network name + scam patterns', () => {
      const result = analyzer.analyze('Jazz: Send OTP to 111 to verify your account and get free balance', 'sms');
      // Should have OTP_REQUEST which is a suspicious scam indicator
      expect(result.indicators.some(i => i.indicator === 'OTP_REQUEST')).toBe(true);
    });
  });

  describe('Risk scoring', () => {
    it('returns safe for clean text', () => {
      const result = analyzer.analyze('Hello, how are you today?', 'sms');
      expect(result.riskLevel).toBe('safe');
    });

    it('returns critical for multiple severe indicators', () => {
      const result = analyzer.analyze('URGENT: Send OTP now. Your bank account will be blocked. Click here to verify. Congratulations you won Rs 50000 free cash prize!', 'sms');
      expect(result.riskScore).toBeGreaterThan(50);
      expect(['high', 'critical']).toContain(result.riskLevel);
    });

    it('caps risk score at 100', () => {
      const veryScammy = 'URGENT: Send OTP and PIN and CVV and password now. Your account will be blocked immediately. Click here to claim your free cash prize lottery winner congratulations! Send money via western union bitcoin transfer.';
      const result = analyzer.analyze(veryScammy, 'sms');
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });
  });
});

// ─── Risk Scorer ─────────────────────────────────────────────────
describe('Risk Scorer', () => {
  const scorer = new RiskScorer();

  it('returns safe for no indicators', () => {
    const result = scorer.calculateScore([]);
    expect(result.score).toBe(0);
    expect(result.level).toBe('safe');
  });

  it('calculates score from severity', () => {
    const result = scorer.calculateScore([
      { severity: 'critical' },
      { severity: 'high' },
    ]);
    expect(result.score).toBe(40); // 25 + 15
    expect(result.level).toBe('high');
  });

  it('uses custom score when provided', () => {
    const result = scorer.calculateScore([
      { severity: 'medium', score: 20 },
    ]);
    expect(result.score).toBe(20);
  });

  it('caps total at 100', () => {
    const indicators = Array(20).fill(null).map(() => ({ severity: 'critical' }));
    const result = scorer.calculateScore(indicators);
    expect(result.score).toBe(100);
    expect(result.level).toBe('critical');
  });

  it('provides category breakdown', () => {
    const result = scorer.calculateScore([
      { severity: 'critical' },
      { severity: 'critical' },
      { severity: 'high' },
    ]);
    expect(result.breakdown.length).toBeGreaterThan(0);
    const critBreakdown = result.breakdown.find(b => b.category === 'critical');
    expect(critBreakdown).toBeDefined();
    expect(critBreakdown!.count).toBe(2);
  });

  it('has consistent thresholds with URL analyzer', () => {
    // Score 0 = safe
    expect(scorer.calculateScore([]).level).toBe('safe');
    // Score 5 = low (1-10)
    expect(scorer.calculateScore([{ severity: 'low' }]).level).toBe('low');
    // Score 25 = medium (11-30)
    expect(scorer.calculateScore([{ severity: 'critical' }]).level).toBe('medium');
    // Score 40 = high (31-60)
    expect(scorer.calculateScore([{ severity: 'critical' }, { severity: 'high' }]).level).toBe('high');
    // Score 65+ = critical
    expect(scorer.calculateScore([
      { severity: 'critical' },
      { severity: 'critical' },
      { severity: 'critical' },
    ]).level).toBe('critical');
  });
});

// ─── Rule Engine ─────────────────────────────────────────────────
describe('Rule Engine', () => {
  const engine = new RuleEngine();

  it('detects OTP request', () => {
    const matches = engine.analyzeText('Please send me your OTP code');
    const otpMatch = matches.find(m => m.rule.id === 'OTP_REQUEST');
    expect(otpMatch).toBeDefined();
    expect(otpMatch!.matched).toBe(true);
  });

  it('detects password request', () => {
    const matches = engine.analyzeText('Tell me your password to verify');
    const match = matches.find(m => m.rule.id === 'PASSWORD_REQUEST');
    expect(match).toBeDefined();
    expect(match!.matched).toBe(true);
  });

  it('detects urgency', () => {
    const matches = engine.analyzeText('Act now! Your account will be blocked immediately');
    const match = matches.find(m => m.rule.id === 'URGENCY');
    expect(match).toBeDefined();
    expect(match!.matched).toBe(true);
  });

  it('detects prize scam', () => {
    const matches = engine.analyzeText('Congratulations you won! Claim your prize now');
    const match = matches.find(m => m.rule.id === 'PRIZE_SCAM');
    expect(match).toBeDefined();
    expect(match!.matched).toBe(true);
  });

  it('detects gambling scam', () => {
    const matches = engine.analyzeText('Spin and win cash! Lucky draw jackpot! Bet and win!');
    const match = matches.find(m => m.rule.id === 'GAMBLING_SCAM');
    expect(match).toBeDefined();
    expect(match!.matched).toBe(true);
  });

  it('detects investment scam', () => {
    const matches = engine.analyzeText('Guaranteed return! Double your money! Risk free investment');
    const match = matches.find(m => m.rule.id === 'INVESTMENT_SCAM');
    expect(match).toBeDefined();
    expect(match!.matched).toBe(true);
  });

  it('detects URL shortener in text', () => {
    const matches = engine.analyzeText('Check this: https://bit.ly/abc123');
    const match = matches.find(m => m.rule.id === 'URL_SHORTENER');
    expect(match).toBeDefined();
    expect(match!.matched).toBe(true);
  });

  it('detects suspicious TLD', () => {
    const matches = engine.analyzeUrl('https://scam-site.xyz/login');
    const match = matches.find(m => m.rule.id === 'SUSPICIOUS_TLD');
    expect(match).toBeDefined();
    expect(match!.matched).toBe(true);
  });

  it('detects lookalike domain', () => {
    const matches = engine.analyzeUrl('https://paypa1-secure.com');
    const match = matches.find(m => m.rule.id === 'LOOKALIKE');
    expect(match).toBeDefined();
    expect(match!.matched).toBe(true);
  });

  it('does not match clean text', () => {
    const matches = engine.analyzeText('Hello, how are you today?');
    const triggered = matches.filter(m => m.matched);
    expect(triggered.length).toBe(0);
  });

  it('allows adding custom rules', () => {
    engine.addRule({
      id: 'CUSTOM_TEST',
      name: 'Custom Test',
      ruleType: 'keyword',
      pattern: 'customkeyword',
      severity: 'high',
      score: 15,
      enabled: true,
      description: 'Test rule',
    });
    const matches = engine.analyzeText('This has customkeyword in it');
    const match = matches.find(m => m.rule.id === 'CUSTOM_TEST');
    expect(match!.matched).toBe(true);
  });

  it('returns all enabled rules', () => {
    const rules = engine.getRules();
    expect(rules.length).toBeGreaterThan(20);
    expect(rules.every(r => r.enabled)).toBe(true);
  });
});

// ─── USSD Analyzer ───────────────────────────────────────────────
describe('USSD Analyzer', () => {
  describe('analyzeUssdCode', () => {
    it('identifies *#21# as call forwarding check', () => {
      const result = analyzeUssdCode('*#21#');
      expect(result).not.toBeNull();
      expect(result!.category).toBe('Call Forwarding');
      expect(result!.risk).toBe('critical');
    });

    it('identifies *2767*3855# as factory reset', () => {
      const result = analyzeUssdCode('*2767*3855#');
      expect(result).not.toBeNull();
      expect(result!.risk).toBe('critical');
      expect(result!.category).toBe('Factory Reset');
    });

    it('identifies **21*<number># as forwarding setup', () => {
      const result = analyzeUssdCode('**21*03001234567#');
      expect(result).not.toBeNull();
      expect(result!.risk).toBe('critical');
      expect(result!.category).toBe('Call Forwarding Setup');
    });

    it('identifies *#002# as cancel all forwarding (safe)', () => {
      const result = analyzeUssdCode('*#002#');
      expect(result).not.toBeNull();
      expect(result!.risk).toBe('caution');
      expect(result!.description).toContain('Cancel');
    });

    it('identifies *111# as safe Jazz service code', () => {
      const result = analyzeUssdCode('*111#');
      expect(result).not.toBeNull();
      expect(result!.risk).toBe('safe');
      expect(result!.category).toBe('Network Service');
    });

    it('identifies *310# as safe Zong code', () => {
      const result = analyzeUssdCode('*310#');
      expect(result).not.toBeNull();
      expect(result!.risk).toBe('safe');
    });

    it('identifies *345# as safe Telenor code', () => {
      const result = analyzeUssdCode('*345#');
      expect(result).not.toBeNull();
      expect(result!.risk).toBe('safe');
    });

    it('returns null for invalid code', () => {
      const result = analyzeUssdCode('not-a-ussd');
      expect(result).toBeNull();
    });

    it('flags unknown complex codes as caution', () => {
      const result = analyzeUssdCode('*#1234*5678#');
      expect(result).not.toBeNull();
      expect(['caution', 'safe']).toContain(result!.risk);
    });
  });

  describe('extractUssdCodes', () => {
    it('extracts codes from text', () => {
      const codes = extractUssdCodes('Dial *#21# to check and *111# for balance');
      expect(codes).toContain('*#21#');
      expect(codes).toContain('*111#');
    });

    it('deduplicates codes', () => {
      const codes = extractUssdCodes('*111# and *111# again');
      expect(codes).toHaveLength(1);
    });

    it('returns empty for no codes', () => {
      const codes = extractUssdCodes('No USSD codes here');
      expect(codes).toHaveLength(0);
    });
  });

  describe('analyzeAllUssdCodes', () => {
    it('analyzes multiple codes in text', () => {
      const results = analyzeAllUssdCodes('Check *#21# and dial *2767*3855#');
      expect(results.length).toBe(2);
      expect(results.every(r => r.risk === 'critical')).toBe(true);
    });
  });
});

// ─── Phone Analyzer ──────────────────────────────────────────────
describe('Phone Analyzer', () => {
  describe('Pakistani numbers', () => {
    it('identifies Jazz network', () => {
      const result = analyzePhoneNumber('03001234567');
      expect(result.country).toBe('Pakistan');
      expect(result.network.name).toContain('Jazz');
      expect(result.isValid).toBe(true);
    });

    it('identifies Telenor network', () => {
      const result = analyzePhoneNumber('03461234567');
      expect(result.network.name).toContain('Telenor');
    });

    it('identifies Zong network', () => {
      const result = analyzePhoneNumber('03701234567');
      expect(result.network.name).toContain('Zong');
    });

    it('identifies Ufone network', () => {
      const result = analyzePhoneNumber('03501234567');
      expect(result.network.name).toContain('Ufone');
    });

    it('detects premium rate numbers', () => {
      const result = analyzePhoneNumber('09001234567');
      expect(result.network.type).toBe('premium');
      expect(result.riskLevel).toBe('critical');
    });

    it('includes complaint authority for high risk', () => {
      const result = analyzePhoneNumber('09001234567');
      expect(result.complaintPath).toBeDefined();
      expect(result.complaintPath!.authority).toContain('NCCIA');
    });

    it('handles international format +92', () => {
      const result = analyzePhoneNumber('+923001234567');
      expect(result.country).toBe('Pakistan');
      expect(result.normalized).toContain('+92');
    });
  });

  describe('International numbers', () => {
    it('identifies US numbers', () => {
      const result = analyzePhoneNumber('+12025551234');
      expect(result.country).toBe('United States');
    });

    it('identifies UK numbers', () => {
      const result = analyzePhoneNumber('+447911123456');
      expect(result.country).toBe('United Kingdom');
    });

    it('identifies India numbers', () => {
      const result = analyzePhoneNumber('+917012345678');
      expect(result.country).toBe('India');
    });

    it('identifies UAE numbers', () => {
      const result = analyzePhoneNumber('+971501234567');
      expect(result.country).toBe('United Arab Emirates');
    });
  });

  describe('Spam reports', () => {
    it('finds known spam numbers', () => {
      const result = analyzePhoneNumber('03001234567');
      expect(result.spamReports.reported).toBe(true);
      expect(result.spamReports.reportCount).toBeGreaterThan(0);
    });

    it('returns no reports for unknown numbers', () => {
      const result = analyzePhoneNumber('03009999999');
      expect(result.spamReports.reported).toBe(false);
    });
  });

  describe('Unknown numbers', () => {
    it('handles unrecognized format', () => {
      const result = analyzePhoneNumber('12345');
      expect(result.country).toBe('Unknown');
      expect(result.isValid).toBe(false);
      expect(result.riskScore).toBeGreaterThan(0);
    });
  });
});

// ─── Document Processor ──────────────────────────────────────────
describe('Document Processor', () => {
  const processor = new DocumentProcessor();

  it('processes plain text files', async () => {
    const buffer = Buffer.from('Hello world. Visit https://example.com for info.', 'utf-8');
    const result = await processor.processFile(buffer, 'test.txt', 'text/plain');
    expect(result.text).toContain('Hello world');
    expect(result.urls).toContain('https://example.com');
    expect(result.filename).toBe('test.txt');
  });

  it('detects suspicious content in text', async () => {
    const buffer = Buffer.from('<script>alert("xss")</script><iframe src="evil.com"></script>', 'utf-8');
    const result = await processor.processFile(buffer, 'test.txt', 'text/plain');
    expect(result.indicators.length).toBeGreaterThan(0);
    expect(result.indicators.some(i => i.includes('script'))).toBe(true);
  });

  it('returns error for unsupported file types', async () => {
    const buffer = Buffer.from('data');
    const result = await processor.processFile(buffer, 'test.bin', 'application/octet-stream');
    expect(result.error).toContain('Unsupported');
  });

  it('extracts URLs from text content', async () => {
    const buffer = Buffer.from('Visit https://google.com and http://example.com/page for details', 'utf-8');
    const result = await processor.processFile(buffer, 'test.txt', 'text/plain');
    expect(result.urls).toContain('https://google.com');
    expect(result.urls).toContain('http://example.com/page');
  });

  it('handles image files gracefully', async () => {
    const buffer = Buffer.from('fake-image-data');
    const result = await processor.processFile(buffer, 'screenshot.png', 'image/png');
    expect(result.filename).toBe('screenshot.png');
    expect(result.error).toContain('OCR');
  });
});

// ─── Complaint Paths ─────────────────────────────────────────────
describe('Complaint Paths', () => {
  it('returns phishing path for OTP_REQUEST indicator', () => {
    const path = getComplaintPathForIndicators(['OTP_REQUEST']);
    expect(path).toBeDefined();
    expect(path!.scamType).toBe('Bank/Wallet Phishing');
    expect(path!.complaintContacts.length).toBeGreaterThan(0);
    expect(path!.onlineComplaintUrl).toContain('nccia');
  });

  it('returns investment path for INVESTMENT_SCAM', () => {
    const path = getComplaintPathForIndicators(['INVESTMENT_SCAM']);
    expect(path).toBeDefined();
    expect(path!.scamType).toBe('Investment Scam');
    expect(path!.complaintContacts.some(c => c.name.includes('SECP'))).toBe(true);
  });

  it('returns gambling path for GAMBLING_SCAM', () => {
    const path = getComplaintPathForIndicators(['GAMBLING_SCAM']);
    expect(path).toBeDefined();
    expect(path!.scamType).toBe('Gambling Scam');
  });

  it('returns generic path for unknown indicators', () => {
    const path = getComplaintPathForIndicators(['UNKNOWN_INDICATOR']);
    expect(path).toBeDefined();
    expect(path!.scamType).toBe('Generic Scam');
  });

  it('returns undefined for safe indicators only', () => {
    const path = getComplaintPathForIndicators(['NETWORK_PROMO']);
    expect(path).toBeUndefined();
  });

  it('has all complaint paths defined', () => {
    expect(complaintPaths.length).toBeGreaterThanOrEqual(9);
  });

  it('all paths have required fields', () => {
    for (const path of complaintPaths) {
      expect(path.scamType).toBeTruthy();
      expect(path.scamTypeUrdu).toBeTruthy();
      expect(path.immediateActions.length).toBeGreaterThan(0);
      expect(path.complaintContacts.length).toBeGreaterThan(0);
      expect(path.onlineComplaintUrl).toBeTruthy();
    }
  });

  it('finds path by type', () => {
    const path = getComplaintPathForType('Job Scam');
    expect(path).toBeDefined();
    expect(path!.scamType).toBe('Job Scam');
  });
});

// ─── Scam Knowledge Base ─────────────────────────────────────────
describe('Scam Knowledge Base', () => {
  it('has 10 scam trend categories', () => {
    expect(scamTrends.length).toBe(10);
  });

  it('has 2025 statistics', () => {
    expect(scamStats2025.length).toBeGreaterThan(0);
    const pkStat = scamStats2025.find(s => s.country === 'Pakistan');
    expect(pkStat).toBeDefined();
    expect(pkStat!.totalReports).toBe(210000);
    expect(pkStat!.totalLosses).toContain('15.8');
  });

  it('returns relevant trends for indicators', () => {
    const trends = getContextForIndicators(['OTP_REQUEST', 'URGENCY']);
    expect(trends.length).toBeGreaterThan(0);
    expect(trends.some(t => t.id === 'phishing_scam')).toBe(true);
  });

  it('returns empty for unknown indicators', () => {
    const trends = getContextForIndicators(['NONEXISTENT']);
    expect(trends.length).toBe(0);
  });

  it('all trends have Urdu translations', () => {
    for (const trend of scamTrends) {
      expect(trend.nameUrdu).toBeTruthy();
      expect(trend.descriptionUrdu).toBeTruthy();
    }
  });

  it('all trends have prevention tips', () => {
    for (const trend of scamTrends) {
      expect(trend.preventionTips.length).toBeGreaterThan(0);
    }
  });
});
