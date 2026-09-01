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

    const history = await sourceService.getVerificationHistory(id);
    return NextResponse.json({ success: true, data: { ...source, verificationHistory: history } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const deleted = await sourceService.deleteSource(id, auth.user.userId);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Source not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Source deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
