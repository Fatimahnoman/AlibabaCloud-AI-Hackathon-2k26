export interface UrlIndicator {
  indicator: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: string;
}

export interface UrlAnalysisResult {
  url: string;
  domain: string;
  subdomain: string;
  tld: string;
  isHttps: boolean;
  hasRedirect: boolean;
  redirectUrl?: string;
  indicators: UrlIndicator[];
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  analysis: string;
}

const BLOCKED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '[::1]',
  'metadata.google.internal',
  '169.254.169.254',
];

const LOOKALIKE_BRANDS: Record<string, string[]> = {
  paypal: ['paypa1', 'paypai', 'paypaI', 'pay-pal', 'paypal-secure', 'paypal-verify'],
  microsoft: ['microsoft-security', 'micros0ft', 'rnicrosoft', 'mircosoft', 'microsoft-verify'],
  apple: ['apple-support', '@pple', 'apple-secure', 'apple-id-verify', 'apple-verification'],
  google: ['google-verify', 'g00gle', 'googie', 'google-security', 'google-account'],
  amazon: ['amazon-security', 'arnazon', 'amazon-verify', 'amazon-prime-secure', 'amaz0n'],
  netflix: ['netflix-billing', 'netfl1x', 'netfliix', 'netflix-secure', 'netflix-verify'],
  whatsapp: ['whatsapp', 'whatsaap', 'whats-app', 'whatsapp-verify', 'whatsapp-secure'],
  facebook: ['facebook-verify', 'faceb00k', 'facebool', 'facebook-secure', 'fb-verify'],
  instagram: ['instagram-verify', 'instagrarn', 'instagram-secure', 'insta-verify'],
  twitter: ['twitter-verify', 'tw1tter', 'twitter-secure', 'twiter'],
  linkedin: ['linkedin-verify', '1inkedin', 'linkedin-secure', 'linkedln'],
  bank: ['bank-secure', 'bank-verify', 'bank-login', 'secure-bank', 'online-bank'],
  government: ['gov-verify', 'government-secure', 'govt-verify', 'official-gov'],
  hbl: ['hbl-secure', 'hbl-verify', 'hbl-login', 'hbl-account'],
  ubl: ['ubi-secure', 'ubl-verify', 'ubl-login', 'ubl-account'],
  jazzcash: ['jazzcash-secure', 'jazzcash-verify', 'jazz-cash-secure'],
  easypaisa: ['easypaisa-secure', 'easypaisa-verify', 'easy-paisa'],
};

const SHORTENER_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'is.gd',
  'buff.ly',
  'ow.ly',
  'rb.gy',
  'cutt.ly',
  'shorturl.at',
];

const SCAM_KEYWORDS: Array<{ keyword: string; severity: 'medium' | 'high' | 'critical'; description: string }> = [
  { keyword: 'cash', severity: 'high', description: 'URL contains "cash" — common in financial scam URLs' },
  { keyword: 'claim', severity: 'high', description: 'URL contains "claim" — common in prize/reward scam URLs' },
  { keyword: 'prize', severity: 'critical', description: 'URL contains "prize" — strong indicator of scam' },
  { keyword: 'winner', severity: 'critical', description: 'URL contains "winner" — strong indicator of scam' },
  { keyword: 'lottery', severity: 'critical', description: 'URL contains "lottery" — classic scam pattern' },
  { keyword: 'inheritance', severity: 'critical', description: 'URL contains "inheritance" — common advance-fee scam' },
  { keyword: 'million', severity: 'high', description: 'URL contains "million" — common in money scam URLs' },
  { keyword: 'billion', severity: 'high', description: 'URL contains "billion" — common in money scam URLs' },
  { keyword: 'free-money', severity: 'critical', description: 'URL contains "free-money" — definite scam' },
  { keyword: 'giveaway', severity: 'high', description: 'URL contains "giveaway" — common phishing lure' },
  { keyword: 'urgent', severity: 'medium', description: 'URL contains "urgent" — urgency is a social engineering tactic' },
  { keyword: 'verify-account', severity: 'high', description: 'URL contains "verify-account" — common in phishing URLs' },
  { keyword: 'secure-account', severity: 'high', description: 'URL contains "secure-account" — commonly abused in scam domains' },
  { keyword: 'login-verify', severity: 'high', description: 'URL contains "login-verify" — common in credential phishing' },
  { keyword: 'update-account', severity: 'high', description: 'URL contains "update-account" — common in phishing lure URLs' },
  { keyword: 'confirm-identity', severity: 'high', description: 'URL contains "confirm-identity" — common in phishing URLs' },
  { keyword: 'rs5000', severity: 'critical', description: 'URL contains "rs5000" — Pakistani rupee scam pattern' },
  { keyword: 'rs10000', severity: 'critical', description: 'URL contains "rs10000" — Pakistani rupee scam pattern' },
  { keyword: 'independence-day', severity: 'high', description: 'URL contains "independence-day" — holiday-themed scam lure' },
  { keyword: 'election', severity: 'high', description: 'URL contains "election" — political scam lure' },
  { keyword: 'bomb', severity: 'high', description: 'URL contains "bomb" — threatening scam pattern' },
  { keyword: 'arrest', severity: 'high', description: 'URL contains "arrest" — threatening scam pattern' },
  { keyword: 'suspend', severity: 'high', description: 'URL contains "suspend" — common account suspension scam' },
  { keyword: 'expire', severity: 'medium', description: 'URL contains "expire" — urgency scam tactic' },
  { keyword: 'bitcoin', severity: 'high', description: 'URL contains "bitcoin" — common in crypto scams' },
  { keyword: 'crypto', severity: 'medium', description: 'URL contains "crypto" — commonly seen in scam URLs' },
];

const SUSPICIOUS_TLDS = [
  'online', 'xyz', 'top', 'buzz', 'icu', 'tk', 'ml', 'ga', 'cf', 'gq',
  'club', 'work', 'click', 'link', 'download', 'racing', 'win', 'bid',
  'stream', 'loan', 'review', 'accountant', 'science', 'party', 'faith',
];

export class UrlAnalyzer {
  async analyzeUrl(url: string): Promise<UrlAnalysisResult> {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return {
        url,
        domain: '',
        subdomain: '',
        tld: '',
        isHttps: false,
        hasRedirect: false,
        indicators: [
          {
            indicator: 'INVALID_URL',
            severity: 'high',
            description: 'URL is malformed and could not be parsed',
          },
        ],
        riskScore: 40,
        riskLevel: 'high',
        analysis: 'URL could not be parsed as a valid URL',
      };
    }

    const { domain, subdomain, tld } = this.parseUrl(url);
    const isHttps = parsed.protocol === 'https:';
    const indicators: UrlIndicator[] = [];

    if (!isHttps) {
      indicators.push({
        indicator: 'NO_HTTPS',
        severity: 'medium',
        description: 'URL does not use HTTPS encryption',
        evidence: `Protocol: ${parsed.protocol}`,
      });
    }

    const shortenerIndicator = this.checkUrlShortener(url);
    if (shortenerIndicator) {
      indicators.push(shortenerIndicator);
    }

    const lookalikeIndicators = this.checkLookalikeDomain(domain);
    indicators.push(...lookalikeIndicators);

    const scamIndicators = this.checkScamKeywords(url);
    indicators.push(...scamIndicators);

    const tldIndicator = this.checkSuspiciousTld(tld);
    if (tldIndicator) {
      indicators.push(tldIndicator);
    }

    const hostname = parsed.hostname.toLowerCase();
    for (const blocked of BLOCKED_HOSTNAMES) {
      if (hostname === blocked || hostname.includes(blocked)) {
        indicators.push({
          indicator: 'BLOCKED_HOST',
          severity: 'critical',
          description: 'URL targets a blocked internal or restricted host',
          evidence: `Hostname "${hostname}" matches blocked entry "${blocked}"`,
        });
      }
    }

    const hasIpPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    if (hasIpPattern) {
      indicators.push({
        indicator: 'IP_ADDRESS_URL',
        severity: 'high',
        description: 'URL uses an IP address instead of a domain name',
        evidence: `IP address: ${hostname}`,
      });
    }

    const port = parsed.port;
    if (port && !['443', '80', ''].includes(port)) {
      indicators.push({
        indicator: 'UNUSUAL_PORT',
        severity: 'medium',
        description: 'URL uses a non-standard port',
        evidence: `Port: ${port}`,
      });
    }

    const pathHasAt = parsed.pathname.includes('@');
    if (pathHasAt) {
      indicators.push({
        indicator: 'OBfuscated_URL',
        severity: 'high',
        description: 'URL contains @ symbol which may be used to obfuscate the actual destination',
        evidence: `Path contains @: ${parsed.pathname}`,
      });
    }

    let hasRedirect = false;
    let redirectUrl: string | undefined;
    try {
      const redirectResult = await this.checkRedirects(url);
      hasRedirect = redirectResult.hasRedirect;
      redirectUrl = redirectResult.redirectUrl;
      if (hasRedirect && redirectUrl) {
        indicators.push({
          indicator: 'URL_REDIRECT',
          severity: 'medium',
          description: 'URL redirects to another location',
          evidence: `Redirects to: ${redirectUrl}`,
        });
      }
    } catch {
      hasRedirect = false;
    }

    try {
      const dnsIndicator = await this.checkDnsResolution(hostname);
      if (dnsIndicator) indicators.push(dnsIndicator);
    } catch { /* skip */ }

    if (isHttps) {
      try {
        const sslIndicator = await this.checkSslCertificate(hostname);
        if (sslIndicator) indicators.push(sslIndicator);
      } catch { /* skip */ }
    }

    try {
      const ageIndicator = await this.checkDomainAge(hostname);
      if (ageIndicator) indicators.push(ageIndicator);
    } catch { /* skip */ }

    const riskScore = this.calculateRiskScore(indicators);
    const riskLevel = this.scoreToLevel(riskScore);

    const analysis = this.generateAnalysis(indicators, riskLevel);

    return {
      url,
      domain,
      subdomain,
      tld,
      isHttps,
      hasRedirect,
      redirectUrl,
      indicators,
      riskScore,
      riskLevel,
      analysis,
    };
  }

  parseUrl(url: string): { domain: string; subdomain: string; tld: string } {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return { domain: '', subdomain: '', tld: '' };
    }

    const hostname = parsed.hostname.toLowerCase();
    const parts = hostname.split('.');

    if (parts.length < 2) {
      return { domain: hostname, subdomain: '', tld: '' };
    }

    const tld = parts[parts.length - 1];
    const domain = parts[parts.length - 2];
    const subdomainParts = parts.slice(0, parts.length - 2);
    const subdomain = subdomainParts.join('.');

    return { domain, subdomain, tld };
  }

  checkLookalikeDomain(domain: string): UrlIndicator[] {
    const indicators: UrlIndicator[] = [];
    const normalizedDomain = domain.toLowerCase();

    for (const [brand, variations] of Object.entries(LOOKALIKE_BRANDS)) {
      if (normalizedDomain === brand) {
        continue;
      }

      if (normalizedDomain.includes(brand)) {
        const isExactBrand = normalizedDomain === brand;
        if (!isExactBrand) {
          indicators.push({
            indicator: 'LOOKALIKE_DOMAIN',
            severity: 'high',
            description: `Domain contains brand name "${brand}" but is not the official domain`,
            evidence: `Domain "${normalizedDomain}" resembles "${brand}"`,
          });
        }
      }

      for (const variation of variations) {
        if (normalizedDomain.includes(variation)) {
          indicators.push({
            indicator: 'TYPOSQUAT_DOMAIN',
            severity: 'critical',
            description: `Domain contains known typosquatting pattern for "${brand}"`,
            evidence: `Domain "${normalizedDomain}" contains pattern "${variation}" for brand "${brand}"`,
          });
        }
      }
    }

    return indicators;
  }

  checkUrlShortener(url: string): UrlIndicator | null {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }

    const hostname = parsed.hostname.toLowerCase();
    const isShortener = SHORTENER_DOMAINS.some(
      (shortener) => hostname === shortener || hostname.endsWith('.' + shortener)
    );

    if (isShortener) {
      return {
        indicator: 'URL_SHORTENER',
        severity: 'medium',
        description: 'URL uses a URL shortening service which hides the true destination',
        evidence: `Shortener domain: ${hostname}`,
      };
    }

    return null;
  }

  checkScamKeywords(url: string): UrlIndicator[] {
    const indicators: UrlIndicator[] = [];
    const lowerUrl = url.toLowerCase();

    for (const { keyword, severity, description } of SCAM_KEYWORDS) {
      if (lowerUrl.includes(keyword)) {
        indicators.push({
          indicator: 'SCAM_KEYWORD',
          severity,
          description,
          evidence: `Found "${keyword}" in URL`,
        });
      }
    }

    return indicators;
  }

  checkSuspiciousTld(tld: string): UrlIndicator | null {
    if (SUSPICIOUS_TLDS.includes(tld.toLowerCase())) {
      return {
        indicator: 'SUSPICIOUS_TLD',
        severity: 'medium',
        description: `URL uses suspicious TLD ".${tld}" — commonly abused by scammers`,
        evidence: `TLD: .${tld}`,
      };
    }
    return null;
  }

  calculateRiskScore(indicators: UrlIndicator[]): number {
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

  async checkRedirects(
    url: string
  ): Promise<{ hasRedirect: boolean; redirectUrl?: string }> {
    let currentUrl = url;
    const maxRedirects = 5;

    for (let i = 0; i < maxRedirects; i++) {
      try {
        const response = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual',
          signal: AbortSignal.timeout(5000),
        });

        const location = response.headers.get('Location');
        if (location && (response.status >= 300 && response.status < 400)) {
          let redirectUrl: string;
          try {
            redirectUrl = new URL(location, currentUrl).href;
          } catch {
            return { hasRedirect: true, redirectUrl: location };
          }

          if (redirectUrl !== url) {
            return { hasRedirect: true, redirectUrl };
          }

          currentUrl = redirectUrl;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    return { hasRedirect: false };
  }

  private async checkDnsResolution(hostname: string): Promise<UrlIndicator | null> {
    try {
      const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
      if (ipRegex.test(hostname)) return null;

      const { execFile } = await import('child_process');
      const { promisify } = await import('util');
      const execFileAsync = promisify(execFile);

      try {
        const { stdout } = await execFileAsync('nslookup', [hostname], { timeout: 5000 });
        const hasRecords = /Address:\s+\d+\.\d+\.\d+\.\d+/.test(stdout) && !/NXDOMAIN/i.test(stdout) && !/can't find/i.test(stdout);
        if (!hasRecords) {
          return {
            indicator: 'DNS_NO_RECORDS',
            severity: 'high',
            description: 'Domain has no DNS records — may be newly registered or defunct',
            evidence: `DNS lookup for "${hostname}" returned no results`,
          };
        }
      } catch {
        return {
          indicator: 'DNS_UNREACHABLE',
          severity: 'high',
          description: 'Domain DNS resolution failed — domain may not exist',
          evidence: `DNS lookup for "${hostname}" failed`,
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  private async checkSslCertificate(hostname: string): Promise<UrlIndicator | null> {
    try {
      const tls = await import('tls');

      return await new Promise((resolve) => {
        const socket = tls.connect({
          host: hostname,
          port: 443,
          servername: hostname,
          rejectUnauthorized: false,
          timeout: 5000,
        }, () => {
          const cert = socket.getPeerCertificate();
          socket.destroy();

          if (!cert || !cert.valid_from) {
            resolve(null);
            return;
          }

          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          const isSelfSigned = cert.issuer?.CN === cert.subject?.CN;
          if (isSelfSigned) {
            resolve({
              indicator: 'SSL_SELF_SIGNED',
              severity: 'high',
              description: 'SSL certificate is self-signed — not trusted by certificate authorities',
              evidence: `Certificate: ${cert.subject?.CN || 'unknown'}`,
            });
            return;
          }

          if (daysUntilExpiry < 7 && daysUntilExpiry > 0) {
            resolve({
              indicator: 'SSL_EXPIRING',
              severity: 'medium',
              description: `SSL certificate expires in ${daysUntilExpiry} days`,
              evidence: `Expires: ${cert.valid_to}`,
            });
            return;
          }

          if (daysUntilExpiry <= 0) {
            resolve({
              indicator: 'SSL_EXPIRED',
              severity: 'high',
              description: 'SSL certificate has expired',
              evidence: `Expired on: ${cert.valid_to}`,
            });
            return;
          }

          resolve(null);
        });

        socket.on('error', () => {
          resolve(null);
        });

        socket.on('timeout', () => {
          socket.destroy();
          resolve(null);
        });
      });
    } catch {
      return null;
    }
  }

  private async checkDomainAge(hostname: string): Promise<UrlIndicator | null> {
    try {
      const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
      if (ipRegex.test(hostname)) return null;

      const resp = await fetch(`https://rdap.verisign.com/com/v1/domain/${hostname}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!resp.ok) return null;

      const data = await resp.json() as { events?: Array<{ eventAction: string; eventDate: string }> };
      const creationEvent = data.events?.find((e) => e.eventAction === 'registration');
      if (!creationEvent) return null;

      const created = new Date(creationEvent.eventDate);
      const now = new Date();
      const ageInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

      if (ageInDays < 30) {
        return {
          indicator: 'DOMAIN_NEW',
          severity: 'critical',
          description: `Domain is only ${ageInDays} days old — newly registered domains are high risk`,
          evidence: `Registered: ${creationEvent.eventDate}`,
        };
      }

      if (ageInDays < 180) {
        return {
          indicator: 'DOMAIN_YOUNG',
          severity: 'high',
          description: `Domain is ${Math.floor(ageInDays / 30)} months old — young domains are higher risk`,
          evidence: `Registered: ${creationEvent.eventDate}`,
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  private scoreToLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
    if (score === 0) return 'safe';
    if (score <= 10) return 'low';
    if (score <= 30) return 'medium';
    if (score <= 60) return 'high';
    return 'critical';
  }

  private generateAnalysis(indicators: UrlIndicator[], riskLevel: string): string {
    if (indicators.length === 0) {
      return 'No suspicious indicators detected in the URL';
    }

    const criticalCount = indicators.filter((i) => i.severity === 'critical').length;
    const highCount = indicators.filter((i) => i.severity === 'high').length;
    const mediumCount = indicators.filter((i) => i.severity === 'medium').length;

    const parts: string[] = [];
    parts.push(`URL analysis found ${indicators.length} indicator(s)`);

    if (criticalCount > 0) {
      parts.push(`${criticalCount} critical`);
    }
    if (highCount > 0) {
      parts.push(`${highCount} high severity`);
    }
    if (mediumCount > 0) {
      parts.push(`${mediumCount} medium severity`);
    }

    parts.push(`Overall risk level: ${riskLevel}`);

    return parts.join('. ');
  }
}

export const urlAnalyzer = new UrlAnalyzer();
