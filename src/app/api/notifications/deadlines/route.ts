import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { notificationService } from '@/services/notification/notification.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const result = await notificationService.getDeadlines(auth.user.userId, { type, status });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'DEADLINES_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const body = await request.json();
    const { title, description, deadlineDate, deadlineType, sourceType, sourceId, isVerified, reminderDaysBefore } = body;
    if (!title || !deadlineDate || !deadlineType) {
      return errorResponse('title, deadlineDate, deadlineType are required', 'VALIDATION_ERROR', 400);
    }
    const result = await notificationService.createDeadline(auth.user.userId, {
      title,
      description,
      deadlineDate: new Date(deadlineDate),
      deadlineType,
      sourceType,
      sourceId,
      isVerified,
      reminderDaysBefore,
    });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'CREATE_DEADLINE_FAILED', 500);
  }
}
