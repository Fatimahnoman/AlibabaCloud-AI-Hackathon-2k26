import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { fraudService } from '@/services/fraud/fraud.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    if (!country) {
      return errorResponse('Country is required', 'COUNTRY_REQUIRED', 400);
    }

    const category = searchParams.get('category') || undefined;
    const procedures = await fraudService.getComplaintProcedures(country, category);
    return successResponse(procedures);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FETCH_PROCEDURES_FAILED', 500);
  }
}
