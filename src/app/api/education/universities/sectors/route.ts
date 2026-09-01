import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { universityService } from '@/services/education/university.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const city = searchParams.get('city') || undefined;
    const type = searchParams.get('type') || undefined;

    const sectors = await universityService.getSectors({ country, city, type });
    return successResponse({ sectors });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'SECTORS_FETCH_FAILED', 500);
  }
}
