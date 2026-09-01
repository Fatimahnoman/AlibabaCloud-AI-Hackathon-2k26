import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { scholarshipService } from '@/services/education';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const country = searchParams.get('country') || undefined;
    const provider = searchParams.get('provider') || undefined;
    const degreeLevel = searchParams.get('degreeLevel') || undefined;
    const category = searchParams.get('category') || undefined;
    const keyword = searchParams.get('keyword') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await scholarshipService.searchScholarships({
      country,
      provider,
      degreeLevel,
      category,
      keyword,
      page,
      limit,
    });

    return successResponse({
      scholarships: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search scholarships';
    return errorResponse(message, 'SCHOLARSHIP_SEARCH_FAILED', 500);
  }
}
