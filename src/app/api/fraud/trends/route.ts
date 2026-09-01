import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(_request: NextRequest) {
  try {
    const { scamTrends, scamStats2024, scamStats2025 } = await import('@/services/fraud/scam-knowledge-base');

    return successResponse({
      trends: scamTrends,
      stats: [...scamStats2024, ...scamStats2025],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FETCH_TRENDS_FAILED', 500);
  }
}
