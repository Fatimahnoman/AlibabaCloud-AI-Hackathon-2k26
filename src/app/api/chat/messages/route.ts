import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validateRequest, chatSchemas } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { chatService } from '@/services/chat/chat.service';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return errorResponse('conversationId is required', 'VALIDATION_ERROR', 400);
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await chatService.getMessages(conversationId, auth.user.userId, { page, limit });
    return successResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Conversation not found') {
      return errorResponse(message, 'NOT_FOUND', 404);
    }
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const rl = checkRateLimit(`chat:message:${auth.user.userId}`, { windowMs: 60000, maxRequests: 30 });
    if (!rl.allowed) {
      return errorResponse('Too many messages. Please wait.', 'RATE_LIMITED', 429);
    }

    const body = await request.json();
    const validation = validateRequest(chatSchemas.sendMessage, body);
    if (!validation.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validation.errors);
    }

    const message = await chatService.sendMessage(auth.user.userId, validation.data);
    return successResponse({ message }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Conversation not found') {
      return errorResponse(message, 'NOT_FOUND', 404);
    }
    if (message.includes('AI service temporarily unavailable')) {
      return errorResponse(message, 'AI_ERROR', 503);
    }
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
