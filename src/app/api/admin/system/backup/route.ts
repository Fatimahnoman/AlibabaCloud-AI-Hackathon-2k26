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

    const backups = await admin.listBackups();
    return successResponse(backups);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new SystemAdminService({ userId: auth.user.userId, ...clientInfo });

    const backup = await admin.createBackup();
    return successResponse(backup, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ERROR', 500);
  }
}
