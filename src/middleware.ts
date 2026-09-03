import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';

const protectedApiRoutes = ['/api/chat', '/api/ai', '/api/documents', '/api/fraud', '/api/urls', '/api/budget', '/api/study', '/api/teacher', '/api/voice', '/api/users', '/api/admin', '/api/profile', '/api/account', '/api/settings', '/api/memory', '/api/audit', '/api/orchestrate', '/api/sources', '/api/verification', '/api/countries', '/api/notifications', '/api/cost-plans'];

const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/refresh', '/api/education', '/api/chat/department'];

const ALLOWED_ORIGINS_RAW = process.env.CORS_ALLOWED_ORIGINS || '';
const ALLOWED_ORIGINS = ALLOWED_ORIGINS_RAW ? ALLOWED_ORIGINS_RAW.split(',').map(s => s.trim()).filter(Boolean) : [];

const MAX_REQUEST_BODY_SIZE = 1 * 1024 * 1024; // 1MB

function getAllowedOrigin(origin: string | null): string | null {
  if (!origin) return null; // same-origin / server-to-server — no CORS header needed
  if (ALLOWED_ORIGINS.length === 0) return origin; // no restriction configured — allow all
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';");
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  if (pathname.startsWith('/api/')) {
    // Request size limit for state-changing methods
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_REQUEST_BODY_SIZE) {
        return NextResponse.json(
          { success: false, message: 'Request body too large', code: 'PAYLOAD_TOO_LARGE' },
          { status: 413 }
        );
      }
    }

    // CORS handling
    const origin = request.headers.get('origin');
    const allowedOrigin = getAllowedOrigin(origin);
    if (origin && !allowedOrigin) {
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 403 });
      }
      return NextResponse.json(
        { success: false, message: 'Origin not allowed', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    if (allowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400');
    }

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));
    if (isPublicApi) {
      return response;
    }

    const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
    if (isProtectedApi) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }

      // Actually verify the JWT token
      const token = authHeader.slice(7);
      const payload = verifyAccessToken(token);
      if (!payload) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }

      // Add verified user info to headers for route handlers
      response.headers.set('X-User-Id', payload.userId);
      response.headers.set('X-User-Role', payload.role);
    }

    // CSRF protection for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token');
      const sessionToken = request.cookies.get('csrf-token')?.value;
      if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
        // Allow login/register without CSRF (they use Bearer tokens)
        const isAuthRoute = pathname.startsWith('/api/auth/');
        if (!isAuthRoute) {
          return NextResponse.json(
            { success: false, message: 'CSRF token invalid', code: 'CSRF_FAILED' },
            { status: 403 }
          );
        }
      }
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
