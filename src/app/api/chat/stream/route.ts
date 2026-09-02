import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { chatService } from '@/services/chat/chat.service';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateRequest, chatSchemas } from '@/lib/utils';

// Extend timeout for AI streaming responses
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const rl = checkRateLimit(`chat:stream:${auth.user.userId}`, { windowMs: 60000, maxRequests: 40 });
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ success: false, message: 'Too many requests. Please wait.', code: 'RATE_LIMITED' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const validation = validateRequest(chatSchemas.sendMessage, body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ success: false, message: 'Validation failed', code: 'VALIDATION_ERROR', details: validation.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const message = await chatService.sendMessage(
            auth.user.userId,
            validation.data,
            (chunk) => {
              const event = `data: ${JSON.stringify({ type: 'chunk', content: chunk.content, done: chunk.done })}\n\n`;
              controller.enqueue(encoder.encode(event));
            }
          );

          const doneEvent = `data: ${JSON.stringify({ type: 'done', messageId: message.id })}\n\n`;
          controller.enqueue(encoder.encode(doneEvent));
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'AI service error';
          const errorEvent = `data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
