import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { chatService } from '@/services/chat/chat.service';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    if (!body.conversationId) {
      return errorResponse('conversationId is required', 'VALIDATION_ERROR', 400);
    }

    const exportData = await chatService.exportConversation(
      body.conversationId,
      auth.user.userId,
      body.format || 'txt'
    );

    return successResponse({ export: exportData });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export failed';
    if (message === 'Conversation not found') {
      return errorResponse(message, 'NOT_FOUND', 404);
    }
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
