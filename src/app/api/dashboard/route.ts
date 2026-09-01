import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const userId = auth.user.userId;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatarUrl: true, country: true },
    });

    // Get budget profile for income/expense queries
    const budgetProfile = await prisma.budgetProfile.findUnique({
      where: { userId },
      select: { id: true },
    }).catch(() => null);

    // Parallel fetch all dashboard data
    const [
      upcomingScholarships,
      recentScholarships,
      recentExpenses,
      applicationWorkspaces,
      recentFraudScans,
      documents,
      savingsGoals,
      upcomingInternships,
      incomeRecords,
    ] = await Promise.all([
      // Upcoming scholarship deadlines (next 30 days)
      prisma.scholarship.findMany({
        where: { deadline: { gte: now, lte: new Date(now.getTime() + 30 * 86400000) } },
        select: { id: true, name: true, provider: true, deadline: true, amount: true, currency: true, country: true },
        orderBy: { deadline: 'asc' },
        take: 5,
      }),

      // Recently added scholarships
      prisma.scholarship.findMany({
        where: { deadline: { gte: now } },
        select: { id: true, name: true, provider: true, deadline: true, category: true, country: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),

      // Recent expenses (if budget profile exists)
      budgetProfile
        ? prisma.expenseRecord.findMany({
            where: { budgetProfileId: budgetProfile.id, date: { gte: monthStart } },
            select: { id: true, amount: true, description: true, categoryId: true, date: true },
            orderBy: { date: 'desc' },
            take: 5,
          })
        : Promise.resolve([]),

      // Application workspaces
      prisma.applicationWorkspace.findMany({
        where: { userId },
        select: { id: true, title: true, institutionName: true, country: true, status: true, deadline: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),

      // Recent fraud scans
      prisma.fraudReport.findMany({
        where: { userId },
        select: { id: true, inputType: true, riskLevel: true, riskScore: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),

      // Recent documents
      prisma.document.findMany({
        where: { userId, deletedAt: null },
        select: { id: true, originalName: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),

      // Savings goals
      prisma.savingsGoal.findMany({
        where: { userId },
        select: { id: true, title: true, targetAmount: true, currentAmount: true, deadline: true },
        take: 3,
      }),

      // Upcoming internship deadlines
      prisma.internship.findMany({
        where: { deadline: { gte: now, lte: new Date(now.getTime() + 30 * 86400000) } },
        select: { id: true, title: true, organization: true, deadline: true, country: true },
        orderBy: { deadline: 'asc' },
        take: 3,
      }).catch(() => []),

      // Income records (if budget profile exists)
      budgetProfile
        ? prisma.incomeRecord.findMany({
            where: { budgetProfileId: budgetProfile.id },
            select: { amount: true },
          })
        : Promise.resolve([]),
    ]);

    const totalIncome = incomeRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const totalExpenses = recentExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return successResponse({
      user: user ? { name: user.name, email: user.email, avatarUrl: user.avatarUrl, country: user.country } : null,
      deadlines: {
        scholarships: upcomingScholarships,
        internships: upcomingInternships,
      },
      budget: {
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        recentExpenses,
      },
      applications: applicationWorkspaces,
      fraudScans: recentFraudScans.map((s) => ({
        ...s,
        riskScore: s.riskScore ? Number(s.riskScore) : 0,
      })),
      documents,
      savings: savingsGoals.map((g) => ({
        ...g,
        targetAmount: Number(g.targetAmount),
        currentAmount: Number(g.currentAmount),
      })),
      newScholarships: recentScholarships,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Dashboard data fetch failed';
    return errorResponse(message, 'DASHBOARD_ERROR', 500);
  }
}
