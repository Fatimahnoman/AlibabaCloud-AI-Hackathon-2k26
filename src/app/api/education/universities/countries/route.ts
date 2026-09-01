import { successResponse, errorResponse } from '@/lib/utils';
import { universityService } from '@/services/education/university.service';

export async function GET() {
  try {
    const countries = await universityService.getCountries();
    return successResponse({ countries });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COUNTRIES_FETCH_FAILED', 500);
  }
}
