import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { chatService } from '@/services/chat/chat.service';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(_request);
    if ('error' in auth) return auth.error;

    const message = await chatService.regenerateLastAssistant(params.id, auth.user.userId);
    return successResponse({ message });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    if (msg === 'Message not found' || msg === 'Conversation not found') {
      return errorResponse(msg, 'NOT_FOUND', 404);
    }
    if (msg.includes('AI service temporarily unavailable')) {
      return errorResponse(msg, 'AI_ERROR', 503);
    }
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
