import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { budgetService } from '@/services/budget/budget.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const records = await budgetService.getIncomeRecords(auth.user.userId);
    return successResponse(records);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'INCOME_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    let profile = await budgetService.getBudgetProfile(auth.user.userId);
    if (!profile) {
      profile = await budgetService.createBudgetProfile(auth.user.userId, {
        monthlyIncome: 0,
        currency: 'USD',
      });
    }

    const body = await request.json();
    const { source, amount, frequency } = body;

    if (!source || !amount || !frequency) {
      return errorResponse('source, amount, and frequency are required', 'VALIDATION_ERROR', 400);
    }

    const record = await budgetService.addIncome(profile.id, { source, amount, frequency });
    return successResponse(record, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'INCOME_CREATE_FAILED', 500);
  }
}
