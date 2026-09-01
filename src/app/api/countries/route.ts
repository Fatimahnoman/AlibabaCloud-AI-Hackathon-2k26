import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { countryIntelligenceService } from '@/services/country-intelligence/country-intelligence.service';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || undefined;
    const popularParam = searchParams.get('popular');
    const popular = popularParam !== null ? popularParam === 'true' : undefined;

    const countries = await countryIntelligenceService.getAllCountries({ region, popular });
    return successResponse(countries);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch countries';
    return errorResponse(message, 'COUNTRIES_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    if (auth.user.role !== 'admin') {
      return errorResponse('Admin access required', 'FORBIDDEN', 403);
    }

    const body = await request.json();
    const { name, code, currency, language } = body;

    if (!name || !code || !currency || !language) {
      return errorResponse('name, code, currency and language are required', 'VALIDATION_ERROR', 400);
    }

    const existing = await prisma.countryProfile.findUnique({ where: { code } });
    if (existing) {
      return errorResponse('Country with this code already exists', 'CONFLICT', 409);
    }

    const country = await prisma.countryProfile.create({
      data: {
        name,
        code,
        currency,
        language,
        region: body.region ?? null,
        capital: body.capital ?? null,
        educationSystem: body.educationSystem ?? null,
        timezone: body.timezone ?? null,
        costOfLivingIndex: body.costOfLivingIndex ?? null,
        qualityOfLifeIndex: body.qualityOfLifeIndex ?? null,
        safetyIndex: body.safetyIndex ?? null,
        popularForStudents: body.popularForStudents ?? false,
        profileImageUrl: body.profileImageUrl ?? null,
        overview: body.overview ?? null,
      },
    });

    return successResponse(country, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create country';
    return errorResponse(message, 'COUNTRY_CREATE_FAILED', 500);
  }
}
