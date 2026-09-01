import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { universityService } from '@/services/education/university.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || undefined;
    const country = searchParams.get('country') || undefined;
    const city = searchParams.get('city') || undefined;
    const type = searchParams.get('type') || undefined;
    const sector = searchParams.get('sector') || undefined;
    const field = searchParams.get('field') || undefined;
    const department = searchParams.get('department') || undefined;
    const program = searchParams.get('program') || undefined;
    const universityId = searchParams.get('universityId') || undefined;
    const hasCampuses = searchParams.get('hasCampuses') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await universityService.searchUniversities({
      keyword,
      country,
      city,
      type,
      sector,
      field,
      department,
      program,
      universityId,
      hasCampuses: hasCampuses || undefined,
      page,
      limit,
    });

    return successResponse({
      universities: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'UNIVERSITY_SEARCH_FAILED', 500);
  }
}
