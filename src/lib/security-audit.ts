export interface SecurityCheckResult {
  passed: boolean;
  issues: string[];
  warnings: string[];
}

export interface SecurityHeaderRecommendation {
  header: string;
  value: string;
  description: string;
}

export interface PasswordAuditResult {
  passed: boolean;
  currentRounds: number;
  minimumRequired: number;
  issues: string[];
}

export interface CorsConfig {
  allowedOrigins: string[];
  wildcard: boolean;
}

export interface FullAuditResult {
  score: number;
  passed: boolean;
  results: {
    environment: SecurityCheckResult;
    headers: SecurityHeaderRecommendation[];
    passwords: PasswordAuditResult;
    cors: CorsConfig;
  };
}

const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'NEXT_PUBLIC_APP_URL'] as const;

const SECRET_ENV_VARS = ['JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;

const MIN_SECRET_LENGTH = 32;

const BCRYPT_ROUNDS = 12;

const MIN_BCRYPT_ROUNDS = 12;

const MIN_AUDIT_SCORE = 90;

const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';

export class SecurityAuditor {
  checkEnvironment(): SecurityCheckResult {
    const isProduction = process.env.NODE_ENV === 'production';
    const issues: string[] = [];
    const warnings: string[] = [];

    for (const varName of REQUIRED_ENV_VARS) {
      const value = process.env[varName];
      if (!value || value.trim() === '') {
        issues.push(`Missing required environment variable: ${varName}`);
      }
    }

    for (const varName of SECRET_ENV_VARS) {
      const value = process.env[varName];
      if (!value) continue;
      if (isProduction && value.length < MIN_SECRET_LENGTH) {
        issues.push(`${varName} must be at least ${MIN_SECRET_LENGTH} characters in production (current: ${value.length})`);
      }
      if (value.includes('change-this')) {
        warnings.push(`${varName} still contains the default placeholder value`);
      }
    }

    if (!process.env.GROQ_API_KEY) {
      warnings.push('GROQ_API_KEY is not set; AI features will be unavailable');
    }

    const corsConfig = this.getCorsConfig();
    if (corsConfig.wildcard) {
      if (isProduction) {
        issues.push('CORS_ALLOWED_ORIGINS must not include "*" in production');
      } else {
        warnings.push('CORS wildcard "*" detected; restrict allowed origins before deploying');
      }
    }

    return { passed: issues.length === 0, issues, warnings };
  }

  checkHeaders(): SecurityHeaderRecommendation[] {
    return [
      {
        header: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
        description: 'Forces HTTPS for two years across all subdomains and enables HSTS preload',
      },
      {
        header: 'Content-Security-Policy',
        value:
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
        description: "Restricts resource loading to trusted origins and blocks framing, injection, and form abuse",
      },
      {
        header: 'X-Frame-Options',
        value: 'DENY',
        description: 'Prevents the site from being embedded in iframes to stop clickjacking',
      },
      {
        header: 'X-Content-Type-Options',
        value: 'nosniff',
        description: 'Disables MIME type sniffing so browsers honor declared content types',
      },
      {
        header: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
        description: 'Limits referrer leakage to the origin on cross-origin requests',
      },
      {
        header: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=()',
        description: 'Denies access to sensitive browser APIs unless explicitly granted',
      },
      {
        header: 'X-DNS-Prefetch-Control',
        value: 'off',
        description: 'Disables DNS prefetching to avoid leaking hostnames of requested resources',
      },
      {
        header: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
        description: 'Isolates browsing context from cross-origin windows opened via window.open or links',
      },
      {
        header: 'Cross-Origin-Resource-Policy',
        value: 'same-origin',
        description: 'Blocks other origins from embedding this site’s resources',
      },
    ];
  }

  auditPasswords(): PasswordAuditResult {
    const issues: string[] = [];

    if (BCRYPT_ROUNDS < MIN_BCRYPT_ROUNDS) {
      issues.push(
        `bcrypt rounds (${BCRYPT_ROUNDS}) are below the recommended minimum of ${MIN_BCRYPT_ROUNDS}`
      );
    }

    return {
      passed: issues.length === 0,
      currentRounds: BCRYPT_ROUNDS,
      minimumRequired: MIN_BCRYPT_ROUNDS,
      issues,
    };
  }

  getCorsConfig(): CorsConfig {
    const raw = process.env.CORS_ALLOWED_ORIGINS || DEFAULT_CORS_ORIGIN;
    const allowedOrigins = raw
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    return {
      allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : [DEFAULT_CORS_ORIGIN],
      wildcard: allowedOrigins.includes('*'),
    };
  }

  runFullAudit(): FullAuditResult {
    const environment = this.checkEnvironment();
    const headers = this.checkHeaders();
    const passwords = this.auditPasswords();
    const cors = this.getCorsConfig();

    let score = 100;
    score -= environment.issues.length * 15;
    score -= environment.warnings.length * 5;
    score -= passwords.passed ? 0 : 20;
    score = Math.max(0, Math.min(100, score));

    const passed =
      environment.passed && passwords.passed && !cors.wildcard && score >= MIN_AUDIT_SCORE;

    return {
      score,
      passed,
      results: { environment, headers, passwords, cors },
    };
  }
}

export const securityAuditor = new SecurityAuditor();
