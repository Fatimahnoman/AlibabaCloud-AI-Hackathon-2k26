import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;

    const workspace = await prisma.applicationWorkspace.findFirst({
      where: {
        id,
        userId: auth.user.userId,
      },
    });

    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    const body = await request.json();
    const { itemOrders } = body;

    if (!Array.isArray(itemOrders)) {
      return errorResponse('itemOrders must be an array', 'VALIDATION_ERROR', 400);
    }

    await prisma.$transaction(
      itemOrders.map((item: { id: string; order: number }) =>
        prisma.applicationChecklistItem.updateMany({
          where: {
            id: item.id,
            workspaceId: id,
          },
          data: { order: item.order },
        })
      )
    );

    const items = await prisma.applicationChecklistItem.findMany({
      where: { workspaceId: id },
      orderBy: { order: 'asc' },
    });

    return successResponse(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'REORDER_CHECKLIST_FAILED', 500);
  }
}
