import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { teacherWorkspaceService } from '@/services/teacher/teacher-workspace.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> },
) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;
    const { id, studentId } = await params;
    const result = await teacherWorkspaceService.getStudentData(studentId, id, auth.user.userId);
    if (!result) return notFoundResponse('Student not found in this classroom');
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'STUDENT_DATA_FAILED', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> },
) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;
    const { id, studentId } = await params;
    const removed = await teacherWorkspaceService.removeStudent(id, studentId, auth.user.userId);
    if (!removed) return notFoundResponse('Student not enrolled');
    return successResponse({ message: 'Student removed' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'REMOVE_FAILED', 500);
  }
}
