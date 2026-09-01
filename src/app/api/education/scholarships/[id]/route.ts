import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { scholarshipService } from '@/services/education';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const scholarship = await scholarshipService.getScholarshipById(params.id);

    return successResponse({ scholarship });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get scholarship';
    if (message.includes('not found')) {
      return errorResponse('Scholarship not found', 'SCHOLARSHIP_NOT_FOUND', 404);
    }
    return errorResponse(message, 'SCHOLARSHIP_FETCH_FAILED', 500);
  }
}
