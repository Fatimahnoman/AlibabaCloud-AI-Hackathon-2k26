import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { teacherWorkspaceService } from '@/services/teacher/teacher-workspace.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;
    const result = await teacherWorkspaceService.getClassrooms(auth.user.userId);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'CLASSROOMS_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;
    const body = await request.json();
    const { name, subject, grade, description } = body;
    if (!name || !subject) return errorResponse('name and subject are required', 'VALIDATION_ERROR', 400);
    const result = await teacherWorkspaceService.createClassroom(auth.user.userId, { name, subject, grade, description });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'CREATE_FAILED', 500);
  }
}
