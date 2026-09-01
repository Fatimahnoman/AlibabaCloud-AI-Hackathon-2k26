import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { budgetService } from '@/services/budget/budget.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const searchParams = request.nextUrl.searchParams;
    const months = parseInt(searchParams.get('months') ?? '6', 10);

    const analysis = await budgetService.getSpendingAnalysis(auth.user.userId, months);
    return successResponse(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ANALYSIS_FETCH_FAILED', 500);
  }
}
