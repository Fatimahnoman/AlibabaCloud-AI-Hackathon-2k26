import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { settingsService } from '@/services/chat/settings.service';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    if (body.confirm !== true) {
      return errorResponse('Confirmation required', 'VALIDATION_ERROR', 400);
    }

    const result = await settingsService.deleteAllChats(auth.user.userId);
    return successResponse(result);
  } catch {
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
