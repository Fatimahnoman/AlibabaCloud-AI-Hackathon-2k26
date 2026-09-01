import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const workspace = await prisma.applicationWorkspace.findFirst({
      where: {
        id,
        userId: auth.user.userId,
      },
    });

    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    const { label, dueDate, category, notes } = body;

    if (!label) {
      return errorResponse('label is required', 'VALIDATION_ERROR', 400);
    }

    const maxOrder = await prisma.applicationChecklistItem.findFirst({
      where: { workspaceId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const item = await prisma.applicationChecklistItem.create({
      data: {
        workspaceId: id,
        label,
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category || null,
        notes: notes || null,
        order: (maxOrder?.order ?? -1) + 1,
      },
    });

    return successResponse(item, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ADD_CHECKLIST_ITEM_FAILED', 500);
  }
}
