import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { notificationService } from '@/services/notification/notification.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const { id } = await params;
    const marked = await notificationService.markAsRead(id, auth.user.userId);
    if (!marked) return notFoundResponse('Notification not found');
    return successResponse({ message: 'Marked as read' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'MARK_READ_FAILED', 500);
  }
}
