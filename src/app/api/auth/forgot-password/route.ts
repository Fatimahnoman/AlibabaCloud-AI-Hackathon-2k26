import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { authService } from '@/services/auth/auth.service';
import { checkRateLimit, AUTH_RATE_LIMITS } from '@/lib/rate-limit';
import { getClientInfo } from '@/lib/auth-middleware';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkRateLimit(`passwordReset:${clientIp}`, AUTH_RATE_LIMITS.passwordReset);
    if (!rateLimit.allowed) {
      return errorResponse('Too many requests. Please try again later.', 'RATE_LIMITED', 429);
    }

    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid email', 'VALIDATION_ERROR', 400);
    }

    const context = getClientInfo(request);
    let resetLink: string | undefined;
    try {
      const result = await authService.requestPasswordReset(validation.data.email, context);
      resetLink = result?.resetLink;
    } catch {
      // Silently ignore — always return success to prevent email enumeration
    }

    // Always return success to prevent email enumeration
    // In dev mode without SMTP, include the reset link so user can still reset
    return successResponse({ 
      message: 'If an account exists with this email, a reset link has been sent.',
      ...(resetLink ? { resetLink } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return errorResponse(message, 'INTERNAL_ERROR', 500);
  }
}
