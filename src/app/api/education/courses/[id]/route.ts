import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { courseService } from '@/services/education';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const course = await courseService.getCourseById(params.id);

    return successResponse({ course });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get course';
    if (message.includes('not found')) {
      return errorResponse('Course not found', 'COURSE_NOT_FOUND', 404);
    }
    return errorResponse(message, 'COURSE_FETCH_FAILED', 500);
  }
}
