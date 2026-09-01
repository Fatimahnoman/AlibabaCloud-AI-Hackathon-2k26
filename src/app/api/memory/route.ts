import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { memoryService } from '@/services/chat/memory.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const memories = await memoryService.getMemory(auth.user.userId);
    return successResponse({ memories });
  } catch {
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    if (!body.key || !body.value) {
      return errorResponse('key and value are required', 'VALIDATION_ERROR', 400);
    }

    const memory = await memoryService.setMemory(
      auth.user.userId,
      body.key,
      body.value,
      body.source || 'manual'
    );

    return successResponse({ memory }, 201);
  } catch {
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      await memoryService.deleteMemory(auth.user.userId, key);
    } else {
      await memoryService.deleteAllMemory(auth.user.userId);
    }

    return successResponse({ deleted: true });
  } catch {
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
