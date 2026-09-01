import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { institutionService } from '@/services/education';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const institution = await institutionService.getInstitutionById(params.id);
    return successResponse(institution);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Institution not found';
    return errorResponse(message, 'INSTITUTION_NOT_FOUND', 404);
  }
}
