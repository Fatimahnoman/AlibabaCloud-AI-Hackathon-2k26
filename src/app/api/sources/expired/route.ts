import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { sourceService } from '@/services/sources/source.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const sources = await sourceService.getExpiredSources();
    return NextResponse.json({ success: true, data: sources });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
