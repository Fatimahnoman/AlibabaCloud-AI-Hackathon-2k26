import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const city = searchParams.get('city') || undefined;
    const type = searchParams.get('type') || undefined;
    const sector = searchParams.get('sector') || undefined;

    if (!country) {
      return successResponse({ universities: [] });
    }

    const where: Prisma.UniversityWhereInput = {};
    where.country = { contains: country };
    if (city) where.city = { contains: city };
    if (type) where.type = { equals: type };
    if (sector) where.sector = { equals: sector };

    const universities = await prisma.university.findMany({
      where,
      select: {
        id: true,
        name: true,
        city: true,
        type: true,
        sector: true,
        _count: { select: { courses: true, departments: true } },
      },
      orderBy: { name: 'asc' },
    });

    return successResponse({ universities });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'UNIVERSITIES_LIST_FAILED', 500);
  }
}
