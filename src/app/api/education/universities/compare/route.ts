import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { universityService } from '@/services/education';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids)) {
      return errorResponse(
        'ids must be an array of university IDs',
        'VALIDATION_ERROR',
        400,
      );
    }

    if (ids.length === 0) {
      return errorResponse(
        'At least one university ID is required',
        'VALIDATION_ERROR',
        400,
      );
    }

    if (ids.length > 4) {
      return errorResponse(
        'Cannot compare more than 4 universities at a time',
        'VALIDATION_ERROR',
        400,
      );
    }

    const comparison = await universityService.compareUniversities(ids);

    return successResponse({ comparison });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to compare universities';
    return errorResponse(message, 'UNIVERSITY_COMPARE_FAILED', 500);
  }
}
