import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { teacherWorkspaceService } from '@/services/teacher/teacher-workspace.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;
    const result = await teacherWorkspaceService.getWorkspaceDashboard(auth.user.userId);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'DASHBOARD_FAILED', 500);
  }
}
