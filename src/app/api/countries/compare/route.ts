import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { countryIntelligenceService } from '@/services/country-intelligence/country-intelligence.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const codes = searchParams.get('codes')?.split(',').filter(Boolean) || [];

    if (codes.length < 2) {
      return errorResponse('At least two country codes are required', 'VALIDATION_ERROR', 400);
    }

    const comparison = await countryIntelligenceService.getCountryComparison(codes);
    return successResponse(comparison);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to compare countries';
    return errorResponse(message, 'COUNTRY_COMPARISON_FAILED', 500);
  }
}
