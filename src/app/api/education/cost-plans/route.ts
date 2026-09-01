import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { financialEducationService } from '@/services/financial-education/financial-education.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const status = request.nextUrl.searchParams.get('status') || undefined;
    const plans = await financialEducationService.getPlans(auth.user.userId, status ? { status } : undefined);

    return successResponse(plans);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_PLANS_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();

    if (!body.title || typeof body.title !== 'string') {
      return errorResponse('title is required', 'VALIDATION_ERROR', 400);
    }

    const plan = await financialEducationService.createPlan(auth.user.userId, {
      title: body.title,
      countryId: body.countryId,
      targetCountry: body.targetCountry,
      targetUniversity: body.targetUniversity,
      studyLevel: body.studyLevel,
      studyField: body.studyField,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      currency: body.currency,
      notes: body.notes,
    });

    return successResponse(plan, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_PLAN_CREATE_FAILED', 500);
  }
}
