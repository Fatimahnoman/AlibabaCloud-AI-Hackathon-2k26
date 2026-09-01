import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { studyService } from '@/services/study/study.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const status = request.nextUrl.searchParams.get('status') ?? undefined;
    const plans = await studyService.getStudyPlans(auth.user.userId, status);
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const plan = await studyService.createStudyPlan(auth.user.userId, body);
    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
