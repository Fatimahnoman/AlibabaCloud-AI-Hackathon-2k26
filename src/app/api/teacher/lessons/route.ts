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

    const result = await teacherService.getLessonPlans(auth.user.userId, subject);
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'LESSONS_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { subject, topic, grade, durationMin } = body;

    if (!subject || !topic || !grade || !durationMin) {
      return errorResponse('subject, topic, grade, and durationMin are required', 'VALIDATION_ERROR', 400);
    }

    const lessonPlan = await teacherService.generateLessonPlan(
      auth.user.userId,
      subject,
      topic,
      grade,
      Number(durationMin)
    );
    return successResponse(lessonPlan);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'LESSON_GENERATE_FAILED', 500);
  }
}
