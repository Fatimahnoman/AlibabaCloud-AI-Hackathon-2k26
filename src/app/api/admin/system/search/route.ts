import { NextRequest } from 'next/server';
import { requireRole, getClientInfo } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { SystemAdminService } from '@/services/admin/system-admin.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new SystemAdminService({ userId: auth.user.userId, ...clientInfo });

    const q = request.nextUrl.searchParams.get('q');
    if (q === null || q.trim().length === 0) {
      return errorResponse('q query parameter is required and must be a non-empty string', 'VALIDATION_ERROR', 400);
    }
    if (q.trim().length > 200) {
      return errorResponse('q query parameter must not exceed 200 characters', 'VALIDATION_ERROR', 400);
    }

    const results = await admin.searchAll(q.trim());
    return successResponse(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ERROR', 500);
  }
}
