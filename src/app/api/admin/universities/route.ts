import { NextRequest } from 'next/server';
import { requireRole, getClientInfo } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { AdminService } from '@/services/admin/admin.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new AdminService({ userId: auth.user.userId, ...clientInfo });

    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam !== null ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam !== null ? parseInt(limitParam, 10) : undefined;

    if (page !== undefined && (isNaN(page) || page < 1)) {
      return errorResponse('Invalid page parameter', 'VALIDATION_ERROR', 400);
    }
    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      return errorResponse('Invalid limit parameter, must be between 1 and 100', 'VALIDATION_ERROR', 400);
    }

    const result = await admin.listUniversities({
      page,
      limit,
      country: searchParams.get('country') || undefined,
      search: searchParams.get('search') || undefined,
    });
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'INTERNAL_ERROR', 500);
  }
}
