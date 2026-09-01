import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (process.env.NODE_ENV === 'production') {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters in production');
  }
  if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be set and at least 32 characters in production');
  }
}

const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'dev-only-jwt-secret-do-not-use-in-prod';
const EFFECTIVE_REFRESH_SECRET = JWT_REFRESH_SECRET || 'dev-only-refresh-secret-do-not-use-in-prod';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, EFFECTIVE_JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' } as jwt.SignOptions);
}

export function generateRefreshToken(userId: string): { token: string; expiresAt: Date } {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const token = jwt.sign({ userId }, EFFECTIVE_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN, algorithm: 'HS256' } as jwt.SignOptions);

  return { token, expiresAt };
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET, { algorithms: ['HS256'] }) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, EFFECTIVE_REFRESH_SECRET, { algorithms: ['HS256'] }) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

export function generateTokenPair(payload: JWTPayload): TokenPair {
  const accessToken = generateAccessToken(payload);
  const { token: refreshToken, expiresAt: refreshTokenExpiresAt } = generateRefreshToken(payload.userId);

  // Parse access token expiry
  const decoded = jwt.decode(accessToken) as { exp?: number };
  const accessTokenExpiresAt = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 15 * 60 * 1000);

  return { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt };
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
