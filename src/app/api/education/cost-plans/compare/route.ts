import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { financialEducationService } from '@/services/financial-education/financial-education.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const comparison = await financialEducationService.getCostComparison(auth.user.userId);

    return successResponse(comparison);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_PLANS_COMPARE_FAILED', 500);
  }
}
