import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { settingsService } from '@/services/chat/settings.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const settings = await settingsService.getSettings(auth.user.userId);
    return successResponse({ settings });
  } catch {
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const allowed = [
      'language', 'chatHistory', 'memoryEnabled', 'autoRead',
      'voiceTranscriptionStorage', 'easyMode', 'theme', 'messageFontSize',
    ];
    const filtered: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) filtered[key] = body[key];
    }

    const settings = await settingsService.updateSettings(auth.user.userId, filtered);
    return successResponse({ settings });
  } catch {
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
