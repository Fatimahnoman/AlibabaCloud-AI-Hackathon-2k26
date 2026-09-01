import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validateRequest, authSchemas } from '@/lib/utils';
import { authService } from '@/services/auth/auth.service';
import { checkRateLimit, AUTH_RATE_LIMITS } from '@/lib/rate-limit';
import { getClientInfo } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkRateLimit(`register:${clientIp}`, AUTH_RATE_LIMITS.register);
    if (!rateLimit.allowed) {
      return errorResponse('Too many registration attempts. Please try again later.', 'RATE_LIMITED', 429);
    }

    // Validate input
    const body = await request.json();
    const validation = validateRequest(authSchemas.register, body);
    if (!validation.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validation.errors);
    }

    // Check password confirmation
    if (validation.data.password !== (body as Record<string, unknown>).confirmPassword) {
      return errorResponse('Passwords do not match', 'PASSWORDS_MISMATCH', 400);
    }

    const context = getClientInfo(request);
    const result = await authService.register(validation.data, context);

    return successResponse({
      user: result.user,
      tokens: result.tokens,
    }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return errorResponse(message, 'REGISTRATION_FAILED', 400);
  }
}
