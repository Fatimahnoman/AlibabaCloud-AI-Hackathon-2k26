import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { courseService } from '@/services/education';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const field = searchParams.get('field') || undefined;
    const level = searchParams.get('level') || undefined;
    const country = searchParams.get('country') || undefined;
    const city = searchParams.get('city') || undefined;
    const keyword = searchParams.get('keyword') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await courseService.searchCourses({
      field,
      level,
      country,
      city,
      keyword,
      page,
      limit,
    });

    return successResponse({
      courses: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search courses';
    return errorResponse(message, 'COURSE_SEARCH_FAILED', 500);
  }
}
