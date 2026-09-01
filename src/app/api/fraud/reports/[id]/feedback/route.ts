import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, validateRequest } from '@/lib/utils';
import { fraudService } from '@/services/fraud/fraud.service';
import { z } from 'zod';

const feedbackSchema = z.object({
  feedback: z.enum(['correct', 'incorrect']),
  comment: z.string().max(1000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const validation = validateRequest(feedbackSchema, body);
    if (!validation.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validation.errors);
    }

    await fraudService.submitFeedback(
      auth.user.userId,
      params.id,
      validation.data.feedback,
      validation.data.comment
    );
    return successResponse({ submitted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FEEDBACK_FAILED', 500);
  }
}
