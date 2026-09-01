export interface FraudRule {
  id: string;
  name: string;
  ruleType: 'keyword' | 'pattern' | 'url' | 'behavioral' | 'domain';
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  enabled: boolean;
  description: string;
  category?: string;
}

export interface RuleMatch {
  rule: FraudRule;
  matched: boolean;
  evidence: string;
  matchedContent?: string;
}

const DEFAULT_RULES: FraudRule[] = [
  {
    id: 'OTP_REQUEST',
    name: 'OTP Request',
    ruleType: 'keyword',
    pattern: 'send.*otp|otp.*share|share.*otp|code.*share|verification code',
    severity: 'critical',
    score: 30,
    enabled: true,
    description: 'Detects requests to share OTP or verification codes',
    category: 'credential_theft',
  },
  {
    id: 'PASSWORD_REQUEST',
    name: 'Password Request',
    ruleType: 'keyword',
    pattern: 'password.*share|share.*password|tell.*password|enter.*password',
    severity: 'critical',
    score: 25,
    enabled: true,
    description: 'Detects requests to share passwords',
    category: 'credential_theft',
  },
  {
    id: 'PIN_REQUEST',
    name: 'PIN Request',
    ruleType: 'keyword',
    pattern: '\\bpin\\b.*share|share.*\\bpin\\b|tell.*\\bpin\\b|enter.*\\bpin\\b',
    severity: 'critical',
    score: 25,
    enabled: true,
    description: 'Detects requests to share PINs',
    category: 'credential_theft',
  },
  {
    id: 'CVV_REQUEST',
    name: 'CVV Request',
    ruleType: 'keyword',
    pattern: 'cvv.*share|share.*cvv|card.*number.*cvv|cvv.*number',
    severity: 'critical',
    score: 25,
    enabled: true,
    description: 'Detects requests to share CVV or card details',
    category: 'credential_theft',
  },
  {
    id: 'URGENCY',
    name: 'Urgency Pressure',
    ruleType: 'behavioral',
    pattern: '(urgent|immediately|within\\s+(?:minutes|hours)|act\\s*now|hurry|last\\s*chance|respond\\s+now|do\\s+it\\s+now|don.t\\s+delay)',
    severity: 'high',
    score: 15,
    enabled: true,
    description: 'Detects urgency and pressure tactics',
    category: 'social_engineering',
  },
  {
    id: 'THREAT',
    name: 'Threat Language',
    ruleType: 'keyword',
    pattern: 'account.*block|account.*suspend|account.*close|police.*arrest|legal.*action',
    severity: 'high',
    score: 20,
    enabled: true,
    description: 'Detects threatening language about account or legal consequences',
    category: 'social_engineering',
  },
  {
    id: 'PRIZE_SCAM',
    name: 'Prize Scam',
    ruleType: 'keyword',
    pattern: 'congratulations.*won|you.*won|prize.*claim|lucky.*winner',
    severity: 'high',
    score: 20,
    enabled: true,
    description: 'Detects prize and lottery scam patterns',
    category: 'scam',
  },
  {
    id: 'FAKE_REFUND',
    name: 'Fake Refund',
    ruleType: 'keyword',
    pattern: 'refund.*claim|money.*back|refund.*process',
    severity: 'medium',
    score: 15,
    enabled: true,
    description: 'Detects fake refund scam patterns',
    category: 'scam',
  },
  {
    id: 'INVESTMENT_SCAM',
    name: 'Investment Scam',
    ruleType: 'keyword',
    pattern: 'guaranteed.*return|double.*money|investment.*opportunity|risk.*free',
    severity: 'high',
    score: 20,
    enabled: true,
    description: 'Detects investment and financial scam patterns',
    category: 'scam',
  },
  {
    id: 'JOB_SCAM',
    name: 'Job Scam',
    ruleType: 'keyword',
    pattern: 'job.*offer|work.*from.*home.*earn|easy.*money|part.*time.*earn',
    severity: 'medium',
    score: 15,
    enabled: true,
    description: 'Detects job scam and fake employment patterns',
    category: 'scam',
  },
  {
    id: 'SCHOLARSHIP_SCAM',
    name: 'Scholarship Scam',
    ruleType: 'keyword',
    pattern: 'scholarship.*guaranteed|admission.*guaranteed|visa.*guaranteed',
    severity: 'high',
    score: 18,
    enabled: true,
    description: 'Detects fake scholarship and admission scam patterns',
    category: 'scam',
  },
  {
    id: 'IMPERSONATION',
    name: 'Bank Impersonation',
    ruleType: 'keyword',
    pattern: 'bank.*official|customer.*care.*bank|support.*team.*bank',
    severity: 'high',
    score: 18,
    enabled: true,
    description: 'Detects bank impersonation attempts',
    category: 'impersonation',
  },
  {
    id: 'PAYMENT_REQUEST',
    name: 'Payment Request',
    ruleType: 'keyword',
    pattern: 'send.*money|transfer.*money|wire.*transfer|western.*union|crypto.*send',
    severity: 'high',
    score: 20,
    enabled: true,
    description: 'Detects requests for money transfers or payments',
    category: 'financial',
  },
  {
    id: 'ACCOUNT_SUSPENSION',
    name: 'Account Suspension Threat',
    ruleType: 'keyword',
    pattern: 'account.*will.*be.*blocked|account.*will.*be.*suspended',
    severity: 'high',
    score: 22,
    enabled: true,
    description: 'Detects threats of account suspension or blocking',
    category: 'social_engineering',
  },
  {
    id: 'URL_SHORTENER',
    name: 'URL Shortener',
    ruleType: 'url',
    pattern: 'bit\\.ly|tinyurl|t\\.co|goo\\.gl|is\\.gd',
    severity: 'medium',
    score: 10,
    enabled: true,
    description: 'Detects use of URL shortening services',
    category: 'url',
  },
  {
    id: 'SUSPICIOUS_TLD',
    name: 'Suspicious TLD',
    ruleType: 'url',
    pattern: '\\.online|\\.xyz|\\.top|\\.buzz|\\.click|\\.work|\\.tk|\\.ml|\\.ga|\\.cf|\\.gq|\\.club|\\.stream|\\.loan|\\.bid|\\.download',
    severity: 'medium',
    score: 8,
    enabled: true,
    description: 'Detects suspicious top-level domains',
    category: 'url',
  },
  {
    id: 'LOOKALIKE',
    name: 'Lookalike Domain',
    ruleType: 'domain',
    pattern: 'paypa1|microsoft-security|apple-support|google-verify|amazon-security|netflix-billing',
    severity: 'high',
    score: 18,
    enabled: true,
    description: 'Detects lookalike or typosquatting domains impersonating brands',
    category: 'impersonation',
  },
  {
    id: 'CREDENTIAL_HARVEST',
    name: 'Credential Harvest',
    ruleType: 'keyword',
    pattern: 'verify.*account|confirm.*identity|update.*payment|verify.*information',
    severity: 'medium',
    score: 12,
    enabled: true,
    description: 'Detects credential harvesting attempts',
    category: 'credential_theft',
  },
  {
    id: 'CRYPTO_PRESSURE',
    name: 'Crypto Pressure',
    ruleType: 'keyword',
    pattern: 'bitcoin|ethereum|crypto.*transfer|wallet.*address|blockchain',
    severity: 'medium',
    score: 10,
    enabled: true,
    description: 'Detects cryptocurrency-related pressure tactics',
    category: 'financial',
  },
  {
    id: 'FAKE_JOB_FEE',
    name: 'Fake Job Fee',
    ruleType: 'keyword',
    pattern: 'process.*fee|training.*fee|registration.*fee|joining.*fee',
    severity: 'high',
    score: 18,
    enabled: true,
    description: 'Detects fake job fee requests',
    category: 'scam',
  },
  {
    id: 'SENDER_MISMATCH',
    name: 'Sender Mismatch',
    ruleType: 'domain',
    pattern: 'from.*bank.*@.*gmail|from.*bank.*@.*yahoo|from.*bank.*@.*hotmail',
    severity: 'high',
    score: 15,
    enabled: true,
    description: 'Detects sender email mismatch with claimed bank identity',
    category: 'impersonation',
  },
  {
    id: 'ATTACHMENT_WARNING',
    name: 'Attachment Warning',
    ruleType: 'keyword',
    pattern: 'attached.*file|see.*attached|open.*attachment',
    severity: 'medium',
    score: 8,
    enabled: true,
    description: 'Detects suspicious attachment references',
    category: 'malware',
  },
  {
    id: 'TIME_PRESSURE',
    name: 'Time Pressure',
    ruleType: 'behavioral',
    pattern: '(expires?\\s+(?:today|now|within)|limited\\s+time\\s+(?:offer|deal|only)|only\\s+today|act\\s+before|expires\\s+in\\s+\\d)',
    severity: 'medium',
    score: 12,
    enabled: true,
    description: 'Detects time pressure tactics',
    category: 'social_engineering',
  },
  {
    id: 'MANDATE_FEE',
    name: 'Mandate Fee',
    ruleType: 'keyword',
    pattern: 'processing.*fee|activation.*fee|service.*charge|withdrawal.*fee',
    severity: 'high',
    score: 16,
    enabled: true,
    description: 'Detects mandatory fee requests',
    category: 'financial',
  },
  {
    id: 'ACCOUNT_THEFT',
    name: 'Account Theft',
    ruleType: 'keyword',
    pattern: 'unauthorized.*transaction|money.*deducted|account.*compromised',
    severity: 'medium',
    score: 10,
    enabled: true,
    description: 'Detects unauthorized transaction or account compromise claims',
    category: 'account_takeover',
  },
  {
    id: 'GAMBLING_SCAM',
    name: 'Gambling/Casino Scam',
    ruleType: 'keyword',
    pattern: 'spin.*win|play.*win.*cash|deposit.*bonus|cashback|sign.*up.*bonus|free.*bonus.*sign|lucky.*draw|jackpot|casino.*online|bet.*win|betting.*app',
    severity: 'critical',
    score: 28,
    enabled: true,
    description: 'Detects online gambling, casino, or betting scam patterns',
    category: 'scam',
  },
  {
    id: 'FAKE_REWARD',
    name: 'Fake Reward/Giveaway',
    ruleType: 'keyword',
    pattern: 'big.*reward|cash.*out|claim.*prize|lucky.*winner|up.*to.*rs|upto.*rs|daily.*bonus|refer.*friend.*earn|spin.*share.*win',
    severity: 'high',
    score: 20,
    enabled: true,
    description: 'Detects fake reward, giveaway, or referral scam patterns',
    category: 'scam',
  },
  {
    id: 'PROMISE_MILLIONS',
    name: 'Promise of Millions',
    ruleType: 'keyword',
    pattern: 'rs\\.?\\s*\\d[\\d,]*,\\d{3}|\\d{1,2},\\d{3},\\d{3}|million.*rupees|lakh.*rupees',
    severity: 'high',
    score: 18,
    enabled: true,
    description: 'Detects promises of very large sums of money',
    category: 'scam',
  },
];

export class RuleEngine {
  private rules: FraudRule[];

  constructor(rules?: FraudRule[]) {
    this.rules = rules ? [...rules] : [...DEFAULT_RULES];
  }

  analyzeText(text: string): RuleMatch[] {
    return this.rules
      .filter((rule) => rule.enabled)
      .map((rule) => this.evaluateRule(rule, text));
  }

  analyzeUrl(url: string): RuleMatch[] {
    return this.rules
      .filter((rule) => rule.enabled && (rule.ruleType === 'url' || rule.ruleType === 'domain'))
      .map((rule) => this.evaluateRule(rule, url));
  }

  getRules(): FraudRule[] {
    return [...this.rules];
  }

  addRule(rule: FraudRule): void {
    const existingIndex = this.rules.findIndex((r) => r.id === rule.id);
    if (existingIndex >= 0) {
      this.rules[existingIndex] = { ...rule };
    } else {
      this.rules.push({ ...rule });
    }
  }

  private evaluateRule(rule: FraudRule, input: string): RuleMatch {
    const regex = new RegExp(rule.pattern, 'gi');
    const matches = input.match(regex);

    if (matches && matches.length > 0) {
      return {
        rule,
        matched: true,
        evidence: `Rule "${rule.name}" triggered: found "${matches[0]}" in input`,
        matchedContent: matches[0],
      };
    }

    return {
      rule,
      matched: false,
      evidence: `Rule "${rule.name}" did not match any content in input`,
    };
  }
}
