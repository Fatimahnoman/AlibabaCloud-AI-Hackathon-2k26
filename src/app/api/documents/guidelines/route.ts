import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { documentIntelligenceService } from '@/services/document-intelligence/document-intelligence.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('documentType');

    if (documentType) {
      const guidelines = documentIntelligenceService.getDocumentTypeGuidelines(documentType);
      if (!guidelines) {
        return successResponse({ documentType, guidelines: null, message: 'No guidelines available for this document type' });
      }
      return successResponse({ documentType, guidelines });
    }

    const allGuidelines = documentIntelligenceService.getAllDocumentTypeGuidelines();
    return successResponse({ guidelines: allGuidelines });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'GUIDELINES_FAILED', 500);
  }
}
