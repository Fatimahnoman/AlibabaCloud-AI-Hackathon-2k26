import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { authService } from '@/services/auth/auth.service';
import { getClientInfo } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.refreshToken) {
      return errorResponse('Refresh token required', 'VALIDATION_ERROR', 400);
    }

    const context = getClientInfo(request);
    const tokens = await authService.refreshToken(body.refreshToken, context);

    return successResponse({ tokens });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    return errorResponse(message, 'TOKEN_REFRESH_FAILED', 401);
  }
}
