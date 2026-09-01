import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { financialEducationService } from '@/services/financial-education/financial-education.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const plan = await financialEducationService.getPlanById(id, auth.user.userId);

    if (!plan) {
      return notFoundResponse('Cost plan not found');
    }

    return successResponse(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_PLAN_FETCH_FAILED', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if ('title' in body) updateData.title = body.title;
    if ('countryId' in body) updateData.countryId = body.countryId;
    if ('targetCountry' in body) updateData.targetCountry = body.targetCountry;
    if ('targetUniversity' in body) updateData.targetUniversity = body.targetUniversity;
    if ('studyLevel' in body) updateData.studyLevel = body.studyLevel;
    if ('studyField' in body) updateData.studyField = body.studyField;
    if ('startDate' in body) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if ('status' in body) updateData.status = body.status;
    if ('currency' in body) updateData.currency = body.currency;
    if ('notes' in body) updateData.notes = body.notes;

    const plan = await financialEducationService.updatePlan(id, auth.user.userId, updateData);

    if (!plan) {
      return notFoundResponse('Cost plan not found');
    }

    return successResponse(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_PLAN_UPDATE_FAILED', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const deleted = await financialEducationService.deletePlan(id, auth.user.userId);

    if (!deleted) {
      return notFoundResponse('Cost plan not found');
    }

    return successResponse({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_PLAN_DELETE_FAILED', 500);
  }
}
