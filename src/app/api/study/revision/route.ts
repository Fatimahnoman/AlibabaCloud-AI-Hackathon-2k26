import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { performanceIntelligenceService } from '@/services/study/performance-intelligence.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const subject = searchParams.get('subject') || undefined;

    const result = await performanceIntelligenceService.getRevisionPlans(auth.user.userId, { status, subject });
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'REVISION_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { subject, topic, notes } = body;

    if (!subject || !topic) {
      return errorResponse('subject and topic are required', 'VALIDATION_ERROR', 400);
    }

    const result = await performanceIntelligenceService.flagForRevision(auth.user.userId, subject, topic, notes);
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FLAG_REVISION_FAILED', 500);
  }
}
