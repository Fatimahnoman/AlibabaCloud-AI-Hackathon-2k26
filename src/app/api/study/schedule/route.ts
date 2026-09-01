import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { studyService } from '@/services/study/study.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const dateParam = request.nextUrl.searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();

    const schedule = await studyService.getDailySchedule(auth.user.userId, date);
    return NextResponse.json({ success: true, data: schedule });
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
    const entry = await studyService.createDailySchedule(auth.user.userId, {
      planId: body.planId,
      date: new Date(body.date),
      subject: body.subject,
      startTime: body.startTime,
      endTime: body.endTime,
      activity: body.activity,
    });
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
