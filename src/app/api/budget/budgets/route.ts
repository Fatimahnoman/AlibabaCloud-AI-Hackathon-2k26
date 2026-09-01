import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { budgetService } from '@/services/budget/budget.service';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const profile = await budgetService.getBudgetProfile(auth.user.userId);
    if (!profile) {
      return successResponse([]);
    }

    const budgets = await prisma.budget.findMany({
      where: { budgetProfileId: profile.id },
      include: { category: true },
    });

    return successResponse(budgets);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'BUDGETS_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const profile = await budgetService.getBudgetProfile(auth.user.userId);
    if (!profile) {
      return errorResponse('Budget profile not found. Create one first.', 'PROFILE_NOT_FOUND', 404);
    }

    const body = await request.json();
    const { categoryId, amount, period } = body;

    if (!categoryId || amount === undefined || !period) {
      return errorResponse('categoryId, amount, and period are required', 'VALIDATION_ERROR', 400);
    }

    const budget = await budgetService.setBudget(profile.id, categoryId, amount, period);
    return successResponse(budget);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'BUDGET_SET_FAILED', 500);
  }
}
