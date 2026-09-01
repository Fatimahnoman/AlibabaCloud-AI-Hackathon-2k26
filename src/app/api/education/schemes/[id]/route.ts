import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { schemeService } from '@/services/education';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheme = await schemeService.getSchemeById(params.id);
    return successResponse(scheme);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scheme not found';
    return errorResponse(message, 'SCHEME_NOT_FOUND', 404);
  }
}
