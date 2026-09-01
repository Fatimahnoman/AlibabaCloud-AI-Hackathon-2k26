import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { institutionService } from '@/services/education';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || undefined;
    const province = searchParams.get('province') || undefined;
    const keyword = searchParams.get('keyword') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await institutionService.searchInstitutions({
      type,
      province,
      keyword,
      status,
      page,
      limit,
    });

    return successResponse({
      institutions: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search institutions';
    return errorResponse(message, 'INSTITUTION_SEARCH_FAILED', 500);
  }
}
