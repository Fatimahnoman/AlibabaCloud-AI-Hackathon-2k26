import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { sourceService } from '@/services/sources/source.service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const source = await sourceService.getSourceById(id, auth.user.userId);
    if (!source) {
      return NextResponse.json({ success: false, message: 'Source not found' }, { status: 404 });
    }

    const previousStatus = source.verificationStatus;
    const updated = await sourceService.verifySource(id, { checkedBy: auth.user.userId });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: updated.verificationStatus,
        httpStatus: updated.checkCount,
        contentChanged: previousStatus !== updated.verificationStatus,
        previousStatus,
        newStatus: updated.verificationStatus,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
