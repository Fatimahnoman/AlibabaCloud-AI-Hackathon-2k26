import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { authService } from '@/services/auth/auth.service';
import { requireAuth, getClientInfo } from '@/lib/auth-middleware';
import { z } from 'zod';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const validation = deleteAccountSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Password is required', 'VALIDATION_ERROR', 400);
    }

    const context = getClientInfo(request);
    await authService.deleteAccount(authResult.user.userId, validation.data.password, context);

    return successResponse({ message: 'Account deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete account';
    return errorResponse(message, 'DELETE_FAILED', 400);
  }
}
