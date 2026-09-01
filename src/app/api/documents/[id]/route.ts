import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { documentIntelligenceService } from '@/services/document-intelligence/document-intelligence.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const analysis = await documentIntelligenceService.getAnalysisById(id, auth.user.userId);

    if (!analysis) {
      return notFoundResponse('Analysis not found');
    }

    return successResponse(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FETCH_FAILED', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const deleted = await documentIntelligenceService.deleteAnalysis(id, auth.user.userId);

    if (!deleted) {
      return notFoundResponse('Analysis not found');
    }

    return successResponse({ message: 'Analysis deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'DELETE_FAILED', 500);
  }
}
