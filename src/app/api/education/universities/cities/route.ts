import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { universityService } from '@/services/education/university.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const type = searchParams.get('type') || undefined;
    const sector = searchParams.get('sector') || undefined;

    const cities = await universityService.getCities({ country, type, sector });
    return successResponse({ cities });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'CITIES_FETCH_FAILED', 500);
  }
}
