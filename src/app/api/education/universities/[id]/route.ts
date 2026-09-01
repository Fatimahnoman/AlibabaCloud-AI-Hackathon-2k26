import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { universityService } from '@/services/education';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const university = await universityService.getUniversityById(params.id);

    return successResponse({ university });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get university';
    if (message.includes('not found')) {
      return errorResponse('University not found', 'UNIVERSITY_NOT_FOUND', 404);
    }
    return errorResponse(message, 'UNIVERSITY_FETCH_FAILED', 500);
  }
}
