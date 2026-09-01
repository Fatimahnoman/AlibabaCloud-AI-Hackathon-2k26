import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { financialEducationService } from '@/services/financial-education/financial-education.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();

    if (!body.countryCode || typeof body.countryCode !== 'string') {
      return errorResponse('countryCode is required', 'VALIDATION_ERROR', 400);
    }

    const result = await financialEducationService.autoPopulateFromCountry(
      id,
      body.countryCode
    );

    return successResponse({ itemsCreated: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'AUTO_POPULATE_FAILED', 500);
  }
}
