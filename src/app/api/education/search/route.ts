import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import {
  courseService,
  universityService,
  scholarshipService,
} from '@/services/education';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || undefined;
    const type = searchParams.get('type') || 'all';

    if (!q) {
      return errorResponse('q (keyword) is required', 'VALIDATION_ERROR', 400);
    }

    const results: Record<string, unknown> = {};

    if (type === 'all' || type === 'courses') {
      const courseResult = await courseService.searchCourses({
        keyword: q,
        page: 1,
        limit: 10,
      });
      results.courses = courseResult.data;
    }

    if (type === 'all' || type === 'universities') {
      const universityResult = await universityService.searchUniversities({
        keyword: q,
        page: 1,
        limit: 10,
      });
      results.universities = universityResult.data;
    }

    if (type === 'all' || type === 'scholarships') {
      const scholarshipResult = await scholarshipService.searchScholarships({
        keyword: q,
        page: 1,
        limit: 10,
      });
      results.scholarships = scholarshipResult.data;
    }

    return successResponse(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to perform search';
    return errorResponse(message, 'SEARCH_FAILED', 500);
  }
}
