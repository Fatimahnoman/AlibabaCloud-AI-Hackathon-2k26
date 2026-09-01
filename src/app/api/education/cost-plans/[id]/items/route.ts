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
    const category = request.nextUrl.searchParams.get('category') || undefined;
    const items = await financialEducationService.getItems(id, category ? { category } : undefined);

    return successResponse(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_ITEMS_FETCH_FAILED', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();

    if (!body.category || !body.label || body.amount === undefined || body.amount === null) {
      return errorResponse('category, label and amount are required', 'VALIDATION_ERROR', 400);
    }

    const item = await financialEducationService.addItem(id, auth.user.userId, {
      category: body.category,
      label: body.label,
      description: body.description,
      amount: body.amount,
      currency: body.currency,
      verificationStatus: body.verificationStatus ?? 'user_provided',
      sourceType: body.sourceType,
      sourceUrl: body.sourceUrl,
      isRequired: body.isRequired,
      quantity: body.quantity,
      notes: body.notes,
    });

    if (!item) {
      return notFoundResponse('Cost plan not found');
    }

    return successResponse(item, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_ITEM_CREATE_FAILED', 500);
  }
}
