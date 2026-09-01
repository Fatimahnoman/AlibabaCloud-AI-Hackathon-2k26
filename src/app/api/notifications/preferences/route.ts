import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { notificationService } from '@/services/notification/notification.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const result = await notificationService.getPreferences(auth.user.userId);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'PREFS_FAILED', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const body = await request.json();
    const result = await notificationService.updatePreferences(auth.user.userId, body);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'UPDATE_PREFS_FAILED', 500);
  }
}
