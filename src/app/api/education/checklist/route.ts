import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { applicationChecklistService } from '@/services/education';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const userId = authResult.user.userId;
    const checklists = await applicationChecklistService.getChecklists(userId);

    return successResponse({ checklists });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get checklists';
    return errorResponse(message, 'CHECKLIST_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const userId = authResult.user.userId;
    const body = await request.json();
    const { title, universityId, scholarshipId } = body;

    if (!title) {
      return errorResponse('title is required', 'VALIDATION_ERROR', 400);
    }

    const checklist = await applicationChecklistService.createChecklist(
      userId,
      title,
      universityId,
      scholarshipId,
    );

    return successResponse({ checklist }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checklist';
    return errorResponse(message, 'CHECKLIST_CREATE_FAILED', 500);
  }
}
