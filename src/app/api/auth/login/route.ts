import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validateRequest, authSchemas } from '@/lib/utils';
import { authService } from '@/services/auth/auth.service';
import { checkRateLimit, AUTH_RATE_LIMITS } from '@/lib/rate-limit';
import { getClientInfo } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkRateLimit(`login:${clientIp}`, AUTH_RATE_LIMITS.login);
    if (!rateLimit.allowed) {
      return errorResponse('Too many login attempts. Please try again later.', 'RATE_LIMITED', 429);
    }

    // Validate input
    const body = await request.json();
    const validation = validateRequest(authSchemas.login, body);
    if (!validation.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validation.errors);
    }

    const context = getClientInfo(request);
    const result = await authService.login(validation.data, context);

    return successResponse({
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return errorResponse(message, 'LOGIN_FAILED', 401);
  }
}
