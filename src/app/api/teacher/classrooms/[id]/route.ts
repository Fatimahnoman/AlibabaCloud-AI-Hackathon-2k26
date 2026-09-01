import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { teacherWorkspaceService } from '@/services/teacher/teacher-workspace.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;
    const { id } = await params;
    const result = await teacherWorkspaceService.getClassroomById(id, auth.user.userId);
    if (!result) return notFoundResponse('Classroom not found');
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
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;
    const { id } = await params;
    const body = await request.json();
    const result = await teacherWorkspaceService.updateClassroom(id, auth.user.userId, body);
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
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;
    const { id } = await params;
    const deleted = await teacherWorkspaceService.deleteClassroom(id, auth.user.userId);
    if (!deleted) return notFoundResponse('Classroom not found');
    return successResponse({ message: 'Deleted' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'DELETE_FAILED', 500);
  }
}
