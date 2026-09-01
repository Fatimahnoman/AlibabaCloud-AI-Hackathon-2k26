import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { verificationService } from '@/services/verification/verification.service';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { entityType, entityId } = body;

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, message: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    const result = await verificationService.verifyEntity(entityType, entityId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const entityType = request.nextUrl.searchParams.get('entityType');
    const entityId = request.nextUrl.searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, message: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    const trustScore = await verificationService.getTrustScore(entityType, entityId);
    return NextResponse.json({ success: true, data: trustScore });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
