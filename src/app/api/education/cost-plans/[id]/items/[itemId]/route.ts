import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import { financialEducationService } from '@/services/financial-education/financial-education.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id: _planId, itemId } = await params;
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if ('category' in body) updateData.category = body.category;
    if ('label' in body) updateData.label = body.label;
    if ('description' in body) updateData.description = body.description;
    if ('amount' in body) updateData.amount = body.amount;
    if ('currency' in body) updateData.currency = body.currency;
    if ('verificationStatus' in body) updateData.verificationStatus = body.verificationStatus;
    if ('sourceType' in body) updateData.sourceType = body.sourceType;
    if ('sourceUrl' in body) updateData.sourceUrl = body.sourceUrl;
    if ('isRequired' in body) updateData.isRequired = body.isRequired;
    if ('quantity' in body) updateData.quantity = body.quantity;
    if ('notes' in body) updateData.notes = body.notes;

    const item = await financialEducationService.updateItem(itemId, auth.user.userId, updateData);

    if (!item) {
      return notFoundResponse('Cost item not found');
    }

    return successResponse(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_ITEM_UPDATE_FAILED', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id: _planId, itemId } = await params;
    const deleted = await financialEducationService.deleteItem(itemId, auth.user.userId);

    if (!deleted) {
      return notFoundResponse('Cost item not found');
    }

    return successResponse({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'COST_ITEM_DELETE_FAILED', 500);
  }
}
