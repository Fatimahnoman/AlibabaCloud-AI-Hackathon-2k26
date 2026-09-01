import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const type = searchParams.get('type') || undefined;
    const field = searchParams.get('field') || undefined;
    const paidType = searchParams.get('paidType') || undefined;
    const keyword = searchParams.get('keyword') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Record<string, unknown> = {};
    if (country) where.country = country;
    if (type) where.type = type;
    if (field) where.field = field;
    if (paidType) where.paidType = paidType;
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { organization: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.internship.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.internship.count({ where }),
    ]);

    return successResponse({
      internships: data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search internships';
    return errorResponse(message, 'INTERNSHIP_SEARCH_FAILED', 500);
  }
}
