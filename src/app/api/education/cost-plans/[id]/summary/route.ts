import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { financialEducationService } from '@/services/financial-education/financial-education.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const summary = await financialEducationService.getCostSummary(id, auth.user.userId);

    if (!summary) {
      return notFoundResponse('Cost plan not found');
    }

    return successResponse(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_SUMMARY_FETCH_FAILED', 500);
  }
}
