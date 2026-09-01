import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { teacherWorkspaceService } from '@/services/teacher/teacher-workspace.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;
    const { id } = await params;
    const result = await teacherWorkspaceService.getResources(id, auth.user.userId);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'RESOURCES_FAILED', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;
    const { id } = await params;
    const body = await request.json();
    const { title, description, resourceType, url, content } = body;
    if (!title || !resourceType) return errorResponse('title and resourceType are required', 'VALIDATION_ERROR', 400);
    const result = await teacherWorkspaceService.addResource(id, auth.user.userId, { title, description, resourceType, url, content });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'ADD_RESOURCE_FAILED', 500);
  }
}
