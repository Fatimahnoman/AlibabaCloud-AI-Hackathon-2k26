import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function GET(
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
      include: {
        checklistItems: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    return successResponse(workspace);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FETCH_WORKSPACE_FAILED', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.applicationWorkspace.findFirst({
      where: {
        id,
        userId: auth.user.userId,
      },
    });

    if (!existing) {
      return notFoundResponse('Workspace not found');
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'title', 'status', 'priority', 'notes', 'deadline',
      'programName', 'institutionName', 'country', 'officialUrl',
      'entityType', 'entityId', 'documentsJson', 'requirementsJson',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'deadline' && body[field]) {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updated = await prisma.applicationWorkspace.update({
      where: { id },
      data: updateData,
      include: {
        checklistItems: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return successResponse(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'UPDATE_WORKSPACE_FAILED', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;

    const existing = await prisma.applicationWorkspace.findFirst({
      where: {
        id,
        userId: auth.user.userId,
      },
    });

    if (!existing) {
      return notFoundResponse('Workspace not found');
    }

    await prisma.applicationWorkspace.delete({
      where: { id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'DELETE_WORKSPACE_FAILED', 500);
  }
}
