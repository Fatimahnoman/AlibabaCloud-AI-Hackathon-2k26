import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, validateRequest, fraudSchemas } from '@/lib/utils';
import { fraudService } from '@/services/fraud/fraud.service';

// Extend timeout for URL scanning
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const validation = validateRequest(fraudSchemas.urlScan, body);
    if (!validation.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validation.errors);
    }

    const result = await fraudService.scanUrl(auth.user.userId, validation.data.url);
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'URL_SCAN_FAILED', 500);
  }
}
