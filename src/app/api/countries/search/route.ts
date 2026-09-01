import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { countryIntelligenceService } from '@/services/country-intelligence/country-intelligence.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || !q.trim()) {
      return errorResponse('Query parameter q is required', 'VALIDATION_ERROR', 400);
    }

    const results = await countryIntelligenceService.searchCountries(q);
    return successResponse(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search countries';
    return errorResponse(message, 'COUNTRY_SEARCH_FAILED', 500);
  }
}
