import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { sourceService } from '@/services/sources/source.service';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { sourceIds } = body;

    if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'sourceIds must be a non-empty array' },
        { status: 400 }
      );
    }

    const result = await sourceService.bulkVerify(sourceIds);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
