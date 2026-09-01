import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { budgetService } from '@/services/budget/budget.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const { title, targetAmount, currentAmount, deadline, status, monthlyContribution } = body;

    const goal = await budgetService.updateSavingsGoal(id, auth.user.userId, {
      ...(title !== undefined && { title }),
      ...(targetAmount !== undefined && { targetAmount }),
      ...(currentAmount !== undefined && { currentAmount }),
      ...(deadline !== undefined && { deadline: new Date(deadline) }),
      ...(status !== undefined && { status }),
      ...(monthlyContribution !== undefined && { monthlyContribution }),
    });

    return successResponse(goal);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'SAVINGS_UPDATE_FAILED', 500);
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

    await budgetService.updateSavingsGoal(id, auth.user.userId, {
      status: 'cancelled',
    });

    return successResponse({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'SAVINGS_DELETE_FAILED', 500);
  }
}
