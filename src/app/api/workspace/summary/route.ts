import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const workspaces = await prisma.applicationWorkspace.findMany({
      where: { userId: auth.user.userId },
      include: {
        checklistItems: {
          select: { isCompleted: true },
        },
      },
    });

    const total = workspaces.length;

    const byStatus: Record<string, number> = {
      researching: 0,
      preparing: 0,
      documents_ready: 0,
      submitted: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
      waitlisted: 0,
      deferred: 0,
      withdrawn: 0,
    };

    for (const ws of workspaces) {
      if (ws.status in byStatus) {
        byStatus[ws.status]++;
      }
    }

    const now = new Date();
    const upcomingDeadlines = workspaces
      .filter((ws) => ws.deadline && new Date(ws.deadline) > now)
      .map((ws) => ({
        id: ws.id,
        title: ws.title,
        deadline: ws.deadline,
        daysLeft: Math.ceil(
          (new Date(ws.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    let totalItems = 0;
    let completedItems = 0;
    for (const ws of workspaces) {
      totalItems += ws.checklistItems.length;
      completedItems += ws.checklistItems.filter((item) => item.isCompleted).length;
    }

    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return successResponse({
      total,
      byStatus,
      upcomingDeadlines,
      overallProgress,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FETCH_SUMMARY_FAILED', 500);
  }
}
