import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { applicationChecklistService } from '@/services/education';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const userId = authResult.user.userId;
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return errorResponse(
        'items must be an array',
        'VALIDATION_ERROR',
        400,
      );
    }

    const updated = await applicationChecklistService.updateChecklist(
      userId,
      params.id,
      items,
    );

    return successResponse({ checklist: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update checklist';
    if (message.includes('not found')) {
      return errorResponse(message, 'CHECKLIST_NOT_FOUND', 404);
    }
    return errorResponse(message, 'CHECKLIST_UPDATE_FAILED', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const userId = authResult.user.userId;
    await applicationChecklistService.deleteChecklist(userId, params.id);

    return successResponse({ message: 'Checklist deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete checklist';
    if (message.includes('not found')) {
      return errorResponse(message, 'CHECKLIST_NOT_FOUND', 404);
    }
    return errorResponse(message, 'CHECKLIST_DELETE_FAILED', 500);
  }
}
