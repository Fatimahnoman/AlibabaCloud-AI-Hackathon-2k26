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
    const type = searchParams.get('type') || undefined;

    const scholarships = await countryIntelligenceService.getCountryScholarships(country.id, type);
    return successResponse(scholarships);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch scholarships';
    return errorResponse(message, 'COUNTRY_SCHOLARSHIPS_FETCH_FAILED', 500);
  }
}
