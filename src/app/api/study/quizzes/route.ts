import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { performanceIntelligenceService } from '@/services/study/performance-intelligence.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;
    const topic = searchParams.get('topic') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await performanceIntelligenceService.getQuizzes(auth.user.userId, { subject, topic, page, limit });
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'QUIZZES_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { subject, topic, title, totalMarks, scoredMarks, timeTakenMin, notes } = body;

    if (!subject || !topic || !title || totalMarks == null || scoredMarks == null) {
      return errorResponse('subject, topic, title, totalMarks, scoredMarks are required', 'VALIDATION_ERROR', 400);
    }

    const result = await performanceIntelligenceService.logQuiz(auth.user.userId, {
      subject, topic, title, totalMarks, scoredMarks, timeTakenMin, notes,
    });
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'LOG_QUIZ_FAILED', 500);
  }
}
