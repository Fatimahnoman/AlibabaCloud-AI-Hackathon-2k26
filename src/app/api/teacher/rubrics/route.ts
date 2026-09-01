import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { teacherService } from '@/services/teacher/teacher.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;

    const rubrics = await teacherService.getRubrics(auth.user.userId);
    return successResponse(rubrics);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'RUBRICS_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { title, subject, assessmentType, criteria, totalPoints } = body;

    if (!title || !subject || !assessmentType || !criteria || !totalPoints) {
      return errorResponse('title, subject, assessmentType, criteria, and totalPoints are required', 'VALIDATION_ERROR', 400);
    }

    const rubric = await teacherService.generateRubric(
      auth.user.userId,
      title,
      subject,
      assessmentType,
      criteria,
      Number(totalPoints)
    );
    return successResponse(rubric);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'RUBRIC_CREATE_FAILED', 500);
  }
}
