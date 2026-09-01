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

    const result = await teacherService.getAssessments(auth.user.userId, subject);
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ASSESSMENTS_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { subject, topic, difficulty, questionCount } = body;

    if (!subject || !topic || !difficulty || !questionCount) {
      return errorResponse('subject, topic, difficulty, and questionCount are required', 'VALIDATION_ERROR', 400);
    }

    const assessment = await teacherService.generateAssessment(
      auth.user.userId,
      subject,
      topic,
      difficulty,
      Number(questionCount)
    );
    return successResponse(assessment);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ASSESSMENT_GENERATE_FAILED', 500);
  }
}
