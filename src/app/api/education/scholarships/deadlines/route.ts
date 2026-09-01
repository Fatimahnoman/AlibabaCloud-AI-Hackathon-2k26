import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { scholarshipService } from '@/services/education';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const scholarships = await scholarshipService.getUpcomingDeadlines(limit);

    return successResponse({ scholarships });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get upcoming deadlines';
    return errorResponse(message, 'DEADLINES_FETCH_FAILED', 500);
  }
}
