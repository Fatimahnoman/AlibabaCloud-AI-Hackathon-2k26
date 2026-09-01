import { NextRequest } from 'next/server';
import { requireRole, getClientInfo } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { AdminService } from '@/services/admin/admin.service';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new AdminService({ userId: auth.user.userId, ...clientInfo });

    const { id } = await params;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400);
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return errorResponse('Request body must be a JSON object', 'VALIDATION_ERROR', 400);
    }

    const reason = typeof body.reason === 'string' ? body.reason : undefined;
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (key !== 'reason') data[key] = value;
    }

    if (Object.keys(data).length === 0) {
      return errorResponse('No fields to update provided', 'VALIDATION_ERROR', 400);
    }
    if (typeof data.name !== 'undefined' && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
      return errorResponse('name must be a non-empty string', 'VALIDATION_ERROR', 400);
    }
    if (typeof data.country !== 'undefined' && (typeof data.country !== 'string' || data.country.trim().length === 0)) {
      return errorResponse('country must be a non-empty string', 'VALIDATION_ERROR', 400);
    }

    const updated = await admin.updateUniversity(id, data, reason);
    if (!updated) {
      return errorResponse('University not found', 'NOT_FOUND', 404);
    }
    return successResponse(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'INTERNAL_ERROR', 500);
  }
}
