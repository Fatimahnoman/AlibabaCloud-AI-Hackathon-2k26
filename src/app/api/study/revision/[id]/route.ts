import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { performanceIntelligenceService } from '@/services/study/performance-intelligence.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse('status is required', 'VALIDATION_ERROR', 400);
    }

    const result = await performanceIntelligenceService.updateRevisionStatus(id, auth.user.userId, status);
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('not found')) return notFoundResponse(message);
    return errorResponse(message, 'UPDATE_FAILED', 500);
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
    const deleted = await performanceIntelligenceService.deleteRevisionPlan(id, auth.user.userId);
    if (!deleted) return notFoundResponse('Revision plan not found');
    return successResponse({ message: 'Deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'DELETE_FAILED', 500);
  }
}
