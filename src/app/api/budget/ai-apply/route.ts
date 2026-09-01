import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import prisma from '@/lib/prisma';

interface BudgetAllocation {
  category: string;
  amount: number;
  percentage?: number;
}

interface ApplyBudgetRequest {
  allocations: BudgetAllocation[];
  period?: string;
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body: ApplyBudgetRequest = await request.json();
    const { allocations, period = 'monthly' } = body;

    if (!allocations || !Array.isArray(allocations) || allocations.length === 0) {
      return errorResponse('allocations array is required', 'VALIDATION_ERROR', 400);
    }

    // Get user's budget profile
    const profile = await prisma.budgetProfile.findUnique({
      where: { userId: auth.user.userId },
    });

    if (!profile) {
      return errorResponse('Budget profile not found. Create one first.', 'PROFILE_NOT_FOUND', 404);
    }

    // Get all available categories for this user
    const categories = await prisma.expenseCategory.findMany({
      where: {
        OR: [{ isDefault: true }, { userId: auth.user.userId }],
      },
    });

    const categoryNameMap = new Map<string, string>();
    for (const cat of categories) {
      categoryNameMap.set(cat.name.toLowerCase(), cat.id);
    }

    const results: Array<{ category: string; amount: number; status: string; budgetId?: string }> = [];
    let applied = 0;
    let skipped = 0;

    for (const alloc of allocations) {
      const normalizedName = alloc.category.toLowerCase().trim();
      const categoryId = categoryNameMap.get(normalizedName);

      if (!categoryId) {
        results.push({
          category: alloc.category,
          amount: alloc.amount,
          status: 'skipped — category not found',
        });
        skipped++;
        continue;
      }

      // Upsert budget for this category
      const budget = await prisma.budget.upsert({
        where: {
          budgetProfileId_categoryId_period: {
            budgetProfileId: profile.id,
            categoryId,
            period,
          },
        },
        update: { amount: alloc.amount },
        create: {
          budgetProfileId: profile.id,
          categoryId,
          amount: alloc.amount,
          period,
        },
      });

      results.push({
        category: alloc.category,
        amount: alloc.amount,
        status: 'applied',
        budgetId: budget.id,
      });
      applied++;
    }

    return successResponse({
      message: `Budget applied: ${applied} categories set, ${skipped} skipped`,
      applied,
      skipped,
      results,
      period,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'BUDGET_APPLY_FAILED', 500);
  }
}
