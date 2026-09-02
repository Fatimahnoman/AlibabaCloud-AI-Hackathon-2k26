import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { budgetService } from '@/services/budget/budget.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const startDate = searchParams.get('startDate') ?? undefined;
    const endDate = searchParams.get('endDate') ?? undefined;

    const result = await budgetService.getExpenses(auth.user.userId, {
      page,
      limit,
      categoryId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'EXPENSES_FETCH_FAILED', 500);
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
    const { categoryId, amount, description, date, isRecurring, recurringFrequency } = body;

    if (!categoryId || !amount || !date) {
      return errorResponse('categoryId, amount, and date are required', 'VALIDATION_ERROR', 400);
    }

    const record = await budgetService.addExpense(profile.id, {
      categoryId,
      amount,
      description,
      date: new Date(date),
      isRecurring,
      recurringFrequency,
    });

    return successResponse(record, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'EXPENSE_CREATE_FAILED', 500);
  }
}
