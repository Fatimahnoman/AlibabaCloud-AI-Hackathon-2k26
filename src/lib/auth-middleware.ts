import { NextRequest } from 'next/server';
import { verifyAccessToken, JWTPayload } from '@/lib/jwt';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api';
import { NextResponse } from 'next/server';

export interface AuthenticatedUser extends JWTPayload {}

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

export function authenticate(request: NextRequest): AuthenticatedUser | null {
  const token = getAuthToken(request);
  if (!token) return null;
  return verifyAccessToken(token);
}

export function requireAuth(request: NextRequest): { user: AuthenticatedUser } | { error: NextResponse } {
  const user = authenticate(request);
  if (!user) {
    return { error: unauthorizedResponse('Authentication required') };
  }
  return { user };
}

export function requireRole(request: NextRequest, role: string): { user: AuthenticatedUser } | { error: NextResponse } {
  const result = requireAuth(request);
  if ('error' in result) return result;
  
  if (result.user.role !== role && result.user.role !== 'admin') {
    return { error: forbiddenResponse('Insufficient permissions') };
  }
  return { user: result.user };
}

export function getClientInfo(request: NextRequest) {
  return {
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}
