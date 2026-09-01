import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { budgetService } from '@/services/budget/budget.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const goals = await budgetService.getSavingsGoals(auth.user.userId);
    return successResponse(goals);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'SAVINGS_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { title, targetAmount, deadline, monthlyContribution } = body;

    if (!title || !targetAmount) {
      return errorResponse('title and targetAmount are required', 'VALIDATION_ERROR', 400);
    }

    const goal = await budgetService.createSavingsGoal(auth.user.userId, {
      title,
      targetAmount,
      deadline: deadline ? new Date(deadline) : undefined,
      monthlyContribution,
    });

    return successResponse(goal);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'SAVINGS_CREATE_FAILED', 500);
  }
}
