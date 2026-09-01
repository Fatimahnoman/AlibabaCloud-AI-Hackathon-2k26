import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { countryIntelligenceService } from '@/services/country-intelligence/country-intelligence.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const countries = await countryIntelligenceService.getPopularCountries();
    return successResponse(countries);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch popular countries';
    return errorResponse(message, 'POPULAR_COUNTRIES_FETCH_FAILED', 500);
  }
}
