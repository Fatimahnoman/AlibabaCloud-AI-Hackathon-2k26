import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const keyword = searchParams.get('keyword') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Record<string, unknown> = {};
    if (province) where.province = province;
    if (category) where.category = category;
    if (status) where.status = status;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
        { eligibility: { contains: keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.cMProgram.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cMProgram.count({ where }),
    ]);

    return successResponse({
      programs: data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search CM programs';
    return errorResponse(message, 'CM_PROGRAM_SEARCH_FAILED', 500);
  }
}
