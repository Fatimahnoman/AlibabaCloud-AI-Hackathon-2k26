import { NextRequest } from 'next/server';
import { requireRole, getClientInfo } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { SystemAdminService } from '@/services/admin/system-admin.service';

const VALID_ROLES = ['user', 'teacher', 'admin'];
const VALID_SORT_FIELDS = ['name', 'email', 'createdAt', 'lastLogin'];

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new SystemAdminService({ userId: auth.user.userId, ...clientInfo });

    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = searchParams.get('sortOrder') || undefined;

    const page = pageParam !== null ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam !== null ? parseInt(limitParam, 10) : undefined;

    if (page !== undefined && (isNaN(page) || page < 1)) {
      return errorResponse('Invalid page parameter, must be greater than 0', 'VALIDATION_ERROR', 400);
    }
    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      return errorResponse('Invalid limit parameter, must be between 1 and 100', 'VALIDATION_ERROR', 400);
    }
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return errorResponse(`Invalid role parameter, must be one of: ${VALID_ROLES.join(', ')}`, 'VALIDATION_ERROR', 400);
    }
    let isActive: boolean | undefined;
    if (isActiveParam !== null) {
      if (isActiveParam === 'true') isActive = true;
      else if (isActiveParam === 'false') isActive = false;
      else return errorResponse('Invalid isActive parameter, must be "true" or "false"', 'VALIDATION_ERROR', 400);
    }
    if (sortBy !== undefined && !VALID_SORT_FIELDS.includes(sortBy)) {
      return errorResponse(`Invalid sortBy parameter, must be one of: ${VALID_SORT_FIELDS.join(', ')}`, 'VALIDATION_ERROR', 400);
    }
    if (sortOrder !== undefined && sortOrder !== 'asc' && sortOrder !== 'desc') {
      return errorResponse('Invalid sortOrder parameter, must be "asc" or "desc"', 'VALIDATION_ERROR', 400);
    }

    const result = await admin.listUsers({ page, limit, search, role, isActive, sortBy, sortOrder });
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ERROR', 500);
  }
}
