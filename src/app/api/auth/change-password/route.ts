import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { authService } from '@/services/auth/auth.service';
import { requireAuth, getClientInfo } from '@/lib/auth-middleware';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400);
    }

    if (validation.data.newPassword !== validation.data.confirmPassword) {
      return errorResponse('Passwords do not match', 'PASSWORDS_MISMATCH', 400);
    }

    const context = getClientInfo(request);
    await authService.changePassword(
      authResult.user.userId,
      validation.data.currentPassword,
      validation.data.newPassword,
      context
    );

    return successResponse({ message: 'Password changed successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password';
    return errorResponse(message, 'CHANGE_PASSWORD_FAILED', 400);
  }
}
