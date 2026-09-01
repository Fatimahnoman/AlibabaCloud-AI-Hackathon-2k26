export type BudgetFrequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'one_time';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface BudgetProfile {
  id: string;
  userId: string;
  monthlyIncome: number;
  currency: string;
  savingsGoal?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeRecord {
  id: string;
  budgetProfileId: string;
  source: string;
  amount: number;
  frequency: BudgetFrequency;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  userId?: string;
  createdAt: Date;
}

export interface ExpenseRecord {
  id: string;
  budgetProfileId: string;
  categoryId: string;
  amount: number;
  description?: string;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: BudgetFrequency;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  budgetProfileId: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  spent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  monthlyContribution?: number;
  createdAt: Date;
  updatedAt: Date;
}
