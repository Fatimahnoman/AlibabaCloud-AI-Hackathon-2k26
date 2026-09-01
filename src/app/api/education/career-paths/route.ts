import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { careerGuidanceService } from '@/services/education';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const field = searchParams.get('field') || undefined;
    const keyword = searchParams.get('keyword') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await careerGuidanceService.getCareerPaths({
      field,
      keyword,
      page,
      limit,
    });

    return successResponse({
      careerPaths: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search career paths';
    return errorResponse(message, 'CAREER_PATH_SEARCH_FAILED', 500);
  }
}
