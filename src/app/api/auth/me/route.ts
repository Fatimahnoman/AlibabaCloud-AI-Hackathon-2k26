import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { authService } from '@/services/auth/auth.service';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = await authService.getCurrentUser(authResult.user.userId);
    if (!user) {
      return errorResponse('User not found', 'USER_NOT_FOUND', 404);
    }

    return successResponse({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    return errorResponse(message, 'INTERNAL_ERROR', 500);
  }
}
