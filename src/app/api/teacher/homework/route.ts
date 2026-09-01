import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { teacherService } from '@/services/teacher/teacher.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') ?? undefined;

    const result = await teacherService.getHomework(auth.user.userId, subject);
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'HOMEWORK_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { subject, topic, grade, title, description, dueDays } = body;

    if (!subject || !topic || !grade || !title || !description || !dueDays) {
      return errorResponse('subject, topic, grade, title, description, and dueDays are required', 'VALIDATION_ERROR', 400);
    }

    const homework = await teacherService.generateHomework(
      auth.user.userId,
      subject,
      topic,
      grade,
      title,
      description,
      Number(dueDays)
    );
    return successResponse(homework);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'HOMEWORK_CREATE_FAILED', 500);
  }
}
