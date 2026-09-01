import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, validateRequest, fraudSchemas } from '@/lib/utils';
import { fraudService } from '@/services/fraud/fraud.service';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const validation = validateRequest(fraudSchemas.scan, body);
    if (!validation.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validation.errors);
    }

    const { inputType, content } = validation.data;
    if (!content) {
      return errorResponse('Content is required for text scan', 'CONTENT_REQUIRED', 400);
    }

    const result = await fraudService.scanText(auth.user.userId, content, inputType as 'sms' | 'text' | 'email');
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'SCAN_FAILED', 500);
  }
}
