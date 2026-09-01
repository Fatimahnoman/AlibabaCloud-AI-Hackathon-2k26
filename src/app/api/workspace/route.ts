import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const entityType = searchParams.get('entityType');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: auth.user.userId };
    if (status) where.status = status;
    if (entityType) where.entityType = entityType;

    const [workspaces, total] = await Promise.all([
      prisma.applicationWorkspace.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          checklistItems: {
            orderBy: { order: 'asc' },
          },
        },
      }),
      prisma.applicationWorkspace.count({ where }),
    ]);

    return successResponse({
      workspaces,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FETCH_WORKSPACES_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { entityType, entityId, title, programName, institutionName, country, deadline, priority, officialUrl } = body;

    if (!entityType || !title) {
      return errorResponse('entityType and title are required', 'VALIDATION_ERROR', 400);
    }

    if (!['university', 'scholarship', 'course'].includes(entityType)) {
      return errorResponse('entityType must be university, scholarship, or course', 'VALIDATION_ERROR', 400);
    }

    const workspace = await prisma.applicationWorkspace.create({
      data: {
        userId: auth.user.userId,
        entityType,
        entityId: entityId || null,
        title,
        programName: programName || null,
        institutionName: institutionName || null,
        country: country || null,
        deadline: deadline ? new Date(deadline) : null,
        priority: priority || 'medium',
        officialUrl: officialUrl || null,
      },
    });

    return successResponse(workspace, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'CREATE_WORKSPACE_FAILED', 500);
  }
}
