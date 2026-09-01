import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
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
      select: { id: true, name: true },
    });

    if (!country) {
      return notFoundResponse('Country not found');
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const verifiedParam = searchParams.get('verified');

    const where: any = { country: country.name };
    if (type) where.type = type;
    if (verifiedParam === 'true') where.verificationStatus = 'verified';
    else if (verifiedParam === 'false') where.verificationStatus = { not: 'verified' };

    const universities = await prisma.university.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return successResponse(universities);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch universities';
    return errorResponse(message, 'COUNTRY_UNIVERSITIES_FETCH_FAILED', 500);
  }
}
