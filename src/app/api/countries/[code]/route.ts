import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { countryIntelligenceService } from '@/services/country-intelligence/country-intelligence.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { code } = await params;
    const country = await countryIntelligenceService.getCountryByCode(code);

    if (!country) {
      return notFoundResponse('Country not found');
    }

    return successResponse(country);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch country';
    return errorResponse(message, 'COUNTRY_FETCH_FAILED', 500);
  }
}
