import prisma from '@/lib/prisma';

export interface LogAIUsageParams {
  userId?: string;
  conversationId?: string;
  provider: string;
  model: string;
  intent?: string;
  detectedLanguage?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  status: string;
  errorMessage?: string;
}

export async function logAIUsage(params: LogAIUsageParams): Promise<void> {
  try {
    await prisma.aIUsageLog.create({
      data: {
        userId: params.userId || null,
        conversationId: params.conversationId || null,
        provider: params.provider,
        model: params.model,
        intent: params.intent || null,
        detectedLanguage: params.detectedLanguage || null,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens: params.totalTokens,
        durationMs: params.durationMs,
        status: params.status,
        errorMessage: params.errorMessage || null,
      },
    });
  } catch {
    // Silently fail — usage tracking should never crash the app
  }
}

export async function getUserUsageStats(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.aIUsageLog.findMany({
    where: { userId, createdAt: { gte: since } },
    select: {
      totalTokens: true,
      provider: true,
      model: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalTokens = logs.reduce((sum, l) => sum + l.totalTokens, 0);
  const requestCount = logs.length;

  return { totalTokens, requestCount, logs };
}
