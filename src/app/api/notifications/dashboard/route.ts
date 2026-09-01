import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { notificationService } from '@/services/notification/notification.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const dashboard = await notificationService.getDashboard(auth.user.userId);
    return successResponse(dashboard);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 'DASHBOARD_FAILED', 500);
  }
}
