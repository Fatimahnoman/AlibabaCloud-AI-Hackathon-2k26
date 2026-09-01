import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { careerGuidanceService } from '@/services/education';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const careerPath = await careerGuidanceService.getCareerPathBySlug(params.slug);

    return successResponse({ careerPath });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get career path';
    if (message.includes('not found')) {
      return errorResponse('Career path not found', 'CAREER_PATH_NOT_FOUND', 404);
    }
    return errorResponse(message, 'CAREER_PATH_FETCH_FAILED', 500);
  }
}
