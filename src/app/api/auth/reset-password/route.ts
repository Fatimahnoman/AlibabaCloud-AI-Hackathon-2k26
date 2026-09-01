import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { authService } from '@/services/auth/auth.service';
import { getClientInfo } from '@/lib/auth-middleware';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400);
    }

    if (validation.data.password !== validation.data.confirmPassword) {
      return errorResponse('Passwords do not match', 'PASSWORDS_MISMATCH', 400);
    }

    const context = getClientInfo(request);
    await authService.resetPassword(validation.data.token, validation.data.password, context);

    return successResponse({ message: 'Password reset successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reset password';
    return errorResponse(message, 'RESET_FAILED', 400);
  }
}
