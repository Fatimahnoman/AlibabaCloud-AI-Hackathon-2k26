import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { performanceIntelligenceService } from '@/services/study/performance-intelligence.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const result = await performanceIntelligenceService.getPerformanceOverview(auth.user.userId);
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'PERFORMANCE_FAILED', 500);
  }
}
