import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { studyService } from '@/services/study/study.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const profile = await studyService.getLearningProfile(auth.user.userId);
    return NextResponse.json({ success: true, data: profile });
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
    const profile = await studyService.createLearningProfile(auth.user.userId, body);
    return NextResponse.json({ success: true, data: profile }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
