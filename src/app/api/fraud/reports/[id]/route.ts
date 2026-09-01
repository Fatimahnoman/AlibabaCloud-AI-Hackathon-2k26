import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { fraudService } from '@/services/fraud/fraud.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const report = await fraudService.getReport(params.id, auth.user.userId);
    if (!report) {
      return notFoundResponse('Report not found');
    }
    return successResponse(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FETCH_REPORT_FAILED', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    await fraudService.deleteReport(params.id, auth.user.userId);
    return successResponse({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Report not found') {
      return notFoundResponse(message);
    }
    return errorResponse(message, 'DELETE_REPORT_FAILED', 500);
  }
}
