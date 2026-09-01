import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { countryIntelligenceService } from '@/services/country-intelligence/country-intelligence.service';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { code } = await params;
    const country = await prisma.countryProfile.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!country) {
      return notFoundResponse('Country not found');
    }

    const { searchParams } = new URL(request.url);
    const visaType = searchParams.get('visaType') || undefined;

    const visaSources = await countryIntelligenceService.getCountryVisaSources(country.id, visaType);
    return successResponse(visaSources);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch visa sources';
    return errorResponse(message, 'COUNTRY_VISA_FETCH_FAILED', 500);
  }
}
