import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { budgetService } from '@/services/budget/budget.service';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const categories = await budgetService.getCategories(auth.user.userId);
    return successResponse(categories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'CATEGORIES_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { name, icon } = body;

    if (!name) {
      return errorResponse('name is required', 'VALIDATION_ERROR', 400);
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name,
        icon: icon ?? null,
        isDefault: false,
        userId: auth.user.userId,
      },
    });

    return successResponse(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'CATEGORY_CREATE_FAILED', 500);
  }
}
