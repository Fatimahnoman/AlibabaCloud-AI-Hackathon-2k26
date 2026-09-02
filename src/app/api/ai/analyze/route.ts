import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { getAIProvider } from '@/services/ai';

// Extend timeout for AI analysis
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { prompt, context, maxTokens } = body as {
      prompt: string;
      context?: string;
      maxTokens?: number;
    };

    if (!prompt || typeof prompt !== 'string') {
      return errorResponse('Prompt is required', 'VALIDATION_ERROR', 400);
    }

    if (prompt.length > 5000) {
      return errorResponse('Prompt too long. Maximum 5,000 characters.', 'VALIDATION_ERROR', 400);
    }

    const provider = getAIProvider();
    const systemPrompt = context
      ? `You are EduGuard AI assistant. Use the following context to answer:\n\n${context}\n\nBe specific, accurate, and helpful. Reference the context data when available.`
      : 'You are EduGuard AI assistant. Be helpful, specific, and accurate. Respond in the user\'s language.';

    const response = await provider.complete({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt,
      temperature: 0.7,
      maxTokens: maxTokens || 2048,
    });

    return successResponse({
      content: response.content,
      usage: response.usage || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI analysis failed';
    return errorResponse(message, 'AI_ANALYSIS_FAILED', 500);
  }
}
