import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id, itemId } = await params;

    const workspace = await prisma.applicationWorkspace.findFirst({
      where: {
        id,
        userId: auth.user.userId,
      },
    });

    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    const existing = await prisma.applicationChecklistItem.findFirst({
      where: {
        id: itemId,
        workspaceId: id,
      },
    });

    if (!existing) {
      return notFoundResponse('Checklist item not found');
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if ('isCompleted' in body) updateData.isCompleted = body.isCompleted;
    if ('label' in body) updateData.label = body.label;
    if ('dueDate' in body) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if ('category' in body) updateData.category = body.category;
    if ('notes' in body) updateData.notes = body.notes;

    const updated = await prisma.applicationChecklistItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return successResponse(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'UPDATE_CHECKLIST_ITEM_FAILED', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id, itemId } = await params;

    const workspace = await prisma.applicationWorkspace.findFirst({
      where: {
        id,
        userId: auth.user.userId,
      },
    });

    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    const existing = await prisma.applicationChecklistItem.findFirst({
      where: {
        id: itemId,
        workspaceId: id,
      },
    });

    if (!existing) {
      return notFoundResponse('Checklist item not found');
    }

    await prisma.applicationChecklistItem.delete({
      where: { id: itemId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'DELETE_CHECKLIST_ITEM_FAILED', 500);
  }
}
