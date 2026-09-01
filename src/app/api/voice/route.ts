import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { getSTTProvider, getTTSProvider, isVoiceAvailable } from '@/services/voice';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    return successResponse({
      available: isVoiceAvailable(),
      stt: { provider: getSTTProvider().name, available: getSTTProvider().isAvailable() },
      tts: { provider: getTTSProvider().name, available: getTTSProvider().isAvailable() },
    });
  } catch {
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { action, text, language } = body;

    if (action === 'tts') {
      const provider = getTTSProvider();
      if (!provider.isAvailable()) {
        return errorResponse('Text-to-speech not available', 'VOICE_UNAVAILABLE', 503);
      }
      const result = await provider.synthesize(text, { language });
      return successResponse({ result });
    }

    if (action === 'stt') {
      return errorResponse('Use /api/voice/transcribe for speech-to-text', 'VALIDATION_ERROR', 400);
    }

    return errorResponse('Invalid action', 'VALIDATION_ERROR', 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Voice service error';
    return errorResponse(message, 'VOICE_ERROR', 503);
  }
}
