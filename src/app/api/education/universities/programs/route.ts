import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { universityService } from '@/services/education/university.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const city = searchParams.get('city') || undefined;
    const type = searchParams.get('type') || undefined;
    const sector = searchParams.get('sector') || undefined;
    const universityId = searchParams.get('universityId') || undefined;
    const department = searchParams.get('department') || undefined;

    const programs = await universityService.getPrograms({ country, city, type, sector, universityId, department });
    return successResponse({ programs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'PROGRAMS_FETCH_FAILED', 500);
  }
}
