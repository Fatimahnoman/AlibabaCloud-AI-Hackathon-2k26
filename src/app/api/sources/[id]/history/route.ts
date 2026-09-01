import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { sourceService } from '@/services/sources/source.service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const source = await sourceService.getSourceById(id, auth.user.userId);
    if (!source) {
      return NextResponse.json({ success: false, message: 'Source not found' }, { status: 404 });
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const history = await sourceService.getVerificationHistory(id, { page, limit });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
