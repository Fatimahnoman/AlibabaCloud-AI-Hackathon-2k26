import { NextRequest } from 'next/server';
import { requireRole, getClientInfo } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { SystemAdminService } from '@/services/admin/system-admin.service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new SystemAdminService({ userId: auth.user.userId, ...clientInfo });

    const { id } = await params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return errorResponse('User ID is required', 'VALIDATION_ERROR', 400);
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400);
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return errorResponse('Request body must be a JSON object', 'VALIDATION_ERROR', 400);
    }

    const reason = body.reason;
    if (typeof reason !== 'string' || reason.trim().length === 0) {
      return errorResponse('reason is required and must be a non-empty string', 'VALIDATION_ERROR', 400);
    }
    if (auth.user.userId === id) {
      return errorResponse('You cannot ban or unban your own account', 'VALIDATION_ERROR', 400);
    }

    const result = await admin.toggleUserActive(id, reason.trim());
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ERROR', 500);
  }
}
