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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const archived = searchParams.get('archived') === 'true';
    const search = searchParams.get('search');

    if (search) {
      const conversations = await chatService.searchConversations(auth.user.userId, search);
      return successResponse({ conversations, total: conversations.length });
    }

    const result = await chatService.getConversations(auth.user.userId, { page, limit, archived });
    return successResponse(result);
  } catch {
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const rl = checkRateLimit(`chat:create:${auth.user.userId}`, { windowMs: 60000, maxRequests: 20 });
    if (!rl.allowed) {
      return errorResponse('Too many requests. Please wait.', 'RATE_LIMITED', 429);
    }

    const body = await request.json();
    const validation = validateRequest(chatSchemas.createConversation, body);
    if (!validation.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, validation.errors);
    }

    const conversation = await chatService.createConversation(auth.user.userId, validation.data);
    return successResponse({ conversation }, 201);
  } catch {
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
