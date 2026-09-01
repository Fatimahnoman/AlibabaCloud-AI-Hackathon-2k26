import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { notificationService } from '@/services/notification/notification.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const { id } = await params;
    const result = await notificationService.getDeadlineById(id, auth.user.userId);
    if (!result) return notFoundResponse('Deadline not found');
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'FETCH_FAILED', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const { id } = await params;
    const body = await request.json();
    const result = await notificationService.updateDeadline(id, auth.user.userId, body);
    if (!result) return notFoundResponse('Deadline not found');
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'UPDATE_FAILED', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const { id } = await params;
    const deleted = await notificationService.deleteDeadline(id, auth.user.userId);
    if (!deleted) return notFoundResponse('Deadline not found');
    return successResponse({ message: 'Deadline deleted' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'DELETE_FAILED', 500);
  }
}
