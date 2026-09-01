import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { fraudService } from '@/services/fraud/fraud.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;

    const authorities = await fraudService.getCyberAuthorities(country);
    return successResponse(authorities);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FETCH_AUTHORITIES_FAILED', 500);
  }
}
