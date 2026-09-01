import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { chatService } from '@/services/chat/chat.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(_request);
    if ('error' in auth) return auth.error;

    const conversation = await chatService.getConversation(params.id, auth.user.userId);
    if (!conversation) {
      return errorResponse('Conversation not found', 'NOT_FOUND', 404);
    }

    return successResponse({ conversation });
  } catch {
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const conversation = await chatService.updateConversation(params.id, auth.user.userId, body);
    return successResponse({ conversation });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Conversation not found') {
      return errorResponse(message, 'NOT_FOUND', 404);
    }
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    await chatService.deleteConversation(params.id, auth.user.userId);
    return successResponse({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Conversation not found') {
      return errorResponse(message, 'NOT_FOUND', 404);
    }
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
