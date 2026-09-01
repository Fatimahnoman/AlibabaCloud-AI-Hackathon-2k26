import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { authService } from '@/services/auth/auth.service';
import { requireAuth, getClientInfo } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json().catch(() => ({})) as { refreshToken?: string };
    const context = getClientInfo(request);
    
    await authService.logout(authResult.user.userId, body.refreshToken, context);

    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return errorResponse(message, 'LOGOUT_FAILED', 500);
  }
}
