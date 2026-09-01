import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { studyService } from '@/services/study/study.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const weekStartParam = request.nextUrl.searchParams.get('weekStart');
    const weekStart = weekStartParam ? new Date(weekStartParam) : undefined;

    const summary = await studyService.getWeeklyStudySummary(auth.user.userId, weekStart);
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
