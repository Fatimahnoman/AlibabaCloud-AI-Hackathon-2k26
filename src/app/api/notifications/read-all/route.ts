import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { notificationService } from '@/services/notification/notification.service';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const count = await notificationService.markAllAsRead(auth.user.userId);
    return successResponse({ markedCount: count });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'MARK_ALL_READ_FAILED', 500);
  }
}
