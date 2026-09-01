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
    const category = searchParams.get('category') || undefined;

    const costs = await countryIntelligenceService.getCountryCosts(country.id, category);
    return successResponse(costs);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch cost info';
    return errorResponse(message, 'COUNTRY_COSTS_FETCH_FAILED', 500);
  }
}
