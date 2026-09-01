import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const mock = {
    $transaction: vi.fn((fns: unknown[]) => Promise.all(fns)),
    savingsGoal: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    expenseRecord: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      groupBy: vi.fn(),
    },
    budget: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    incomeRecord: {
      findMany: vi.fn(),
    },
    budgetProfile: {
      findUnique: vi.fn(),
    },
    expenseCategory: {
      findMany: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
import { BudgetService } from '@/services/budget/budget.service';

const mockedPrisma = vi.mocked(prisma);

describe('BudgetService', () => {
  let service: BudgetService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BudgetService();
  });

  describe('getSavingsGoals', () => {
    it('returns active savings goals for user', async () => {
      const goals = [
        { id: 'g1', userId: 'u1', title: 'Laptop', targetAmount: 1500, currentAmount: 500, status: 'active' },
        { id: 'g2', userId: 'u1', title: 'Trip', targetAmount: 3000, currentAmount: 0, status: 'active' },
      ];
      mockedPrisma.savingsGoal.findMany.mockResolvedValue(goals as never);

      const result = await service.getSavingsGoals('u1');

      expect(result).toEqual([
        { id: 'g1', title: 'Laptop', targetAmount: 1500, currentAmount: 500, monthlyContribution: 0, deadline: null },
        { id: 'g2', title: 'Trip', targetAmount: 3000, currentAmount: 0, monthlyContribution: 0, deadline: null },
      ]);
      expect(mockedPrisma.savingsGoal.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', status: 'active' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns empty array when no goals exist', async () => {
      mockedPrisma.savingsGoal.findMany.mockResolvedValue([]);

      const result = await service.getSavingsGoals('u1');

      expect(result).toEqual([]);
    });
  });

  describe('createSavingsGoal', () => {
    it('creates a savings goal with all fields', async () => {
      const goalData = { title: 'Laptop', targetAmount: 1500, deadline: new Date('2025-12-31'), monthlyContribution: 200 };
      const created = { id: 'g1', userId: 'u1', ...goalData, currentAmount: 0, status: 'active', createdAt: new Date(), updatedAt: new Date() };
      mockedPrisma.savingsGoal.create.mockResolvedValue(created as never);

      const result = await service.createSavingsGoal('u1', goalData);

      expect(mockedPrisma.savingsGoal.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          title: 'Laptop',
          targetAmount: 1500,
          deadline: goalData.deadline,
          monthlyContribution: 200,
        },
      });
      expect(result.id).toBe('g1');
    });

    it('creates a savings goal without optional fields', async () => {
      const created = { id: 'g2', userId: 'u1', title: 'Book', targetAmount: 50, currentAmount: 0, status: 'active', createdAt: new Date(), updatedAt: new Date() };
      mockedPrisma.savingsGoal.create.mockResolvedValue(created as never);

      await service.createSavingsGoal('u1', { title: 'Book', targetAmount: 50 });

      expect(mockedPrisma.savingsGoal.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          title: 'Book',
          targetAmount: 50,
          deadline: undefined,
          monthlyContribution: undefined,
        },
      });
    });
  });

  describe('updateSavingsGoal', () => {
    it('updates goal fields', async () => {
      const updated = { id: 'g1', userId: 'u1', title: 'New Laptop', targetAmount: 2000, currentAmount: 800, status: 'active' };
      mockedPrisma.savingsGoal.update.mockResolvedValue(updated as never);

      const result = await service.updateSavingsGoal('g1', 'u1', { title: 'New Laptop', targetAmount: 2000, currentAmount: 800 });

      expect(mockedPrisma.savingsGoal.update).toHaveBeenCalledWith({
        where: { id: 'g1', userId: 'u1' },
        data: {
          title: 'New Laptop',
          targetAmount: 2000,
          currentAmount: 800,
        },
      });
      expect(result.title).toBe('New Laptop');
    });

    it('only sends defined fields in update', async () => {
      mockedPrisma.savingsGoal.update.mockResolvedValue({ id: 'g1', status: 'completed' } as never);

      await service.updateSavingsGoal('g1', 'u1', { status: 'completed' });

      expect(mockedPrisma.savingsGoal.update).toHaveBeenCalledWith({
        where: { id: 'g1', userId: 'u1' },
        data: { status: 'completed' },
      });
    });

    it('propagates Prisma error for wrong userId (record not found)', async () => {
      mockedPrisma.savingsGoal.update.mockRejectedValue(new Error('Record to update not found'));

      await expect(service.updateSavingsGoal('g1', 'wrong-user', { title: 'X' })).rejects.toThrow('Record to update not found');
    });
  });

  describe('getSpendingAnalysis', () => {
    it('returns grouped expenses by month', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue({ id: 'bp1', userId: 'u1' } as never);
      mockedPrisma.expenseRecord.findMany.mockResolvedValue([
        { date: new Date('2025-01-15'), amount: 100, category: { name: 'Food' } },
        { date: new Date('2025-01-20'), amount: 50, category: { name: 'Transport' } },
        { date: new Date('2025-02-05'), amount: 200, category: { name: 'Food' } },
      ] as never);

      const result = await service.getSpendingAnalysis('u1', 6);

      expect(result).toHaveLength(2);
      expect(result[0].month).toBe('2025-01');
      expect(result[0].categories).toEqual([
        { category: 'Food', amount: 100 },
        { category: 'Transport', amount: 50 },
      ]);
      expect(result[1].month).toBe('2025-02');
      expect(result[1].categories).toEqual([
        { category: 'Food', amount: 200 },
      ]);
    });

    it('returns empty array when no profile exists', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue(null);

      const result = await service.getSpendingAnalysis('u1');

      expect(result).toEqual([]);
      expect(mockedPrisma.expenseRecord.findMany).not.toHaveBeenCalled();
    });

    it('rounds amounts to 2 decimal places', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue({ id: 'bp1', userId: 'u1' } as never);
      mockedPrisma.expenseRecord.findMany.mockResolvedValue([
        { date: new Date('2025-01-10'), amount: 33.333, category: { name: 'Food' } },
        { date: new Date('2025-01-12'), amount: 16.666, category: { name: 'Food' } },
      ] as never);

      const result = await service.getSpendingAnalysis('u1');

      expect(result[0].categories[0].amount).toBe(50);
    });
  });

  describe('getExpenses', () => {
    it('returns paginated expenses', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue({ id: 'bp1', userId: 'u1' } as never);
      mockedPrisma.expenseRecord.findMany.mockResolvedValue([{ id: 'e1', amount: 50 }] as never);
      mockedPrisma.expenseRecord.count.mockResolvedValue(1);

      const result = await service.getExpenses('u1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('returns empty result when no profile exists', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue(null);

      const result = await service.getExpenses('nonexistent');

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('applies filters for categoryId and date range', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue({ id: 'bp1', userId: 'u1' } as never);
      mockedPrisma.expenseRecord.findMany.mockResolvedValue([]);
      mockedPrisma.expenseRecord.count.mockResolvedValue(0);

      const start = new Date('2025-01-01');
      const end = new Date('2025-01-31');
      await service.getExpenses('u1', { categoryId: 'cat1', startDate: start, endDate: end, isRecurring: true });

      expect(mockedPrisma.expenseRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat1',
            date: { gte: start, lte: end },
            isRecurring: true,
          }),
        })
      );
    });
  });

  describe('getBudgetSummary', () => {
    it('calculates correct totals with frequency normalization', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue({
        id: 'bp1',
        userId: 'u1',
        incomeRecords: [
          { amount: 5000, frequency: 'monthly' },
          { amount: 500, frequency: 'weekly' },
          { amount: 12000, frequency: 'yearly' },
        ],
        expenseRecords: [
          { categoryId: 'cat1', amount: 200, date: new Date() },
          { categoryId: 'cat1', amount: 150, date: new Date() },
          { categoryId: 'cat2', amount: 300, date: new Date() },
        ],
      } as never);
      mockedPrisma.expenseCategory.findMany.mockResolvedValue([
        { id: 'cat1', name: 'Food' },
        { id: 'cat2', name: 'Transport' },
      ] as never);

      const result = await service.getBudgetSummary('u1');

      const expectedIncome = 5000 + 500 * 4.33 + 12000 / 12;
      expect(result.totalIncome).toBe(Math.round(expectedIncome * 100) / 100);
      expect(result.totalExpenses).toBe(650);
      expect(result.savings).toBe(Math.round((expectedIncome - 650) * 100) / 100);
      expect(result.categoryBreakdown).toHaveLength(2);
    });

    it('returns zeroed summary when no profile exists', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue(null);

      const result = await service.getBudgetSummary('nonexistent');

      expect(result).toEqual({
        totalIncome: 0,
        totalExpenses: 0,
        savings: 0,
        savingsRate: 0,
        categoryBreakdown: [],
      });
    });

    it('handles biweekly income frequency', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue({
        id: 'bp1',
        incomeRecords: [{ amount: 2000, frequency: 'biweekly' }],
        expenseRecords: [],
      } as never);
      mockedPrisma.expenseCategory.findMany.mockResolvedValue([]);

      const result = await service.getBudgetSummary('u1');

      expect(result.totalIncome).toBe(Math.round(2000 * 2.17 * 100) / 100);
    });

    it('ignores one_time income in total', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue({
        id: 'bp1',
        incomeRecords: [{ amount: 10000, frequency: 'one_time' }],
        expenseRecords: [],
      } as never);
      mockedPrisma.expenseCategory.findMany.mockResolvedValue([]);

      const result = await service.getBudgetSummary('u1');

      expect(result.totalIncome).toBe(0);
    });

    it('sets savingsRate to 0 when income is 0', async () => {
      mockedPrisma.budgetProfile.findUnique.mockResolvedValue({
        id: 'bp1',
        incomeRecords: [],
        expenseRecords: [{ categoryId: 'c1', amount: 100, date: new Date() }],
      } as never);
      mockedPrisma.expenseCategory.findMany.mockResolvedValue([{ id: 'c1', name: 'Food' }] as never);

      const result = await service.getBudgetSummary('u1');

      expect(result.savingsRate).toBe(0);
    });
  });

  describe('addExpense', () => {
    it('creates expense and updates budget spent', async () => {
      const expenseRecord = { id: 'e1', budgetProfileId: 'bp1', amount: 100 };
      mockedPrisma.$transaction.mockResolvedValue([expenseRecord, { count: 1 }]);

      const result = await service.addExpense('bp1', {
        categoryId: 'cat1',
        amount: 100,
        description: 'Groceries',
        date: new Date('2025-01-15'),
      });

      expect(result.id).toBe('e1');
      expect(mockedPrisma.$transaction).toHaveBeenCalled();
      const txCalls = mockedPrisma.$transaction.mock.calls[0][0] as unknown[];
      expect(txCalls).toHaveLength(2);
    });

    it('defaults isRecurring to false', async () => {
      mockedPrisma.$transaction.mockResolvedValue([{ id: 'e2' }, { count: 0 }]);

      await service.addExpense('bp1', {
        categoryId: 'cat1',
        amount: 50,
        date: new Date(),
      });

      expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);
      const txArray = mockedPrisma.$transaction.mock.calls[0][0] as unknown[];
      expect(txArray).toHaveLength(2);
    });
  });

  describe('setBudget', () => {
    it('upserts budget record', async () => {
      const budget = { id: 'b1', budgetProfileId: 'bp1', categoryId: 'cat1', amount: 500, period: 'monthly', spent: 0 };
      mockedPrisma.budget.upsert.mockResolvedValue(budget as never);

      const result = await service.setBudget('bp1', 'cat1', 500, 'monthly');

      expect(mockedPrisma.budget.upsert).toHaveBeenCalledWith({
        where: {
          budgetProfileId_categoryId_period: {
            budgetProfileId: 'bp1',
            categoryId: 'cat1',
            period: 'monthly',
          },
        },
        update: { amount: 500 },
        create: {
          budgetProfileId: 'bp1',
          categoryId: 'cat1',
          amount: 500,
          period: 'monthly',
        },
      });
      expect(result.amount).toBe(500);
    });
  });
});
