import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { teacherService } from '@/services/teacher/teacher.service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const deleted = await teacherService.deleteLessonPlan(id, auth.user.userId);
    if (!deleted) {
      return errorResponse('Lesson plan not found', 'NOT_FOUND', 404);
    }
    return successResponse({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'LESSON_DELETE_FAILED', 500);
  }
}
