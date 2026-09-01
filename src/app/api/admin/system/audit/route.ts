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

    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam !== null ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam !== null ? parseInt(limitParam, 10) : undefined;

    if (page !== undefined && (isNaN(page) || page < 1)) {
      return errorResponse('Invalid page parameter, must be greater than 0', 'VALIDATION_ERROR', 400);
    }
    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      return errorResponse('Invalid limit parameter, must be between 1 and 100', 'VALIDATION_ERROR', 400);
    }

    const userId = searchParams.get('userId') || undefined;
    const action = searchParams.get('action') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const dateFromParam = searchParams.get('dateFrom') || undefined;
    const dateToParam = searchParams.get('dateTo') || undefined;

    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;
    if (dateFromParam !== undefined) {
      dateFrom = new Date(dateFromParam);
      if (isNaN(dateFrom.getTime())) {
        return errorResponse('Invalid dateFrom parameter, must be a valid ISO date string', 'VALIDATION_ERROR', 400);
      }
    }
    if (dateToParam !== undefined) {
      dateTo = new Date(dateToParam);
      if (isNaN(dateTo.getTime())) {
        return errorResponse('Invalid dateTo parameter, must be a valid ISO date string', 'VALIDATION_ERROR', 400);
      }
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return errorResponse('dateFrom must not be after dateTo', 'VALIDATION_ERROR', 400);
    }

    const result = await admin.getAuditTrail({ page, limit, userId, action, entityType, dateFrom, dateTo });
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ERROR', 500);
  }
}
