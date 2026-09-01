import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { auditService } from '@/services/audit/audit.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const action = request.nextUrl.searchParams.get('action');
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '20', 10) || 20));

    const is_admin = auth.user.role === 'admin';

    if (is_admin) {
      const logs = await auditService.getRecentLogs({ page, limit, action: action || undefined });
      return NextResponse.json({ success: true, data: logs });
    }

    const logs = await auditService.getUserLogs(auth.user.userId, { page, limit });
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
