import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { studyService } from '@/services/study/study.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const subject = request.nextUrl.searchParams.get('subject') ?? undefined;
    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '20', 10);

    const result = await studyService.getStudySessions(auth.user.userId, {
      subject,
      page,
      pageSize: limit,
    });
    return NextResponse.json({ success: true, data: result });
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
    const session = await studyService.logStudySession(auth.user.userId, {
      subject: body.subject,
      topic: body.topic,
      durationMin: body.durationMin,
      startTime: new Date(body.startTime),
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      notes: body.notes,
      rating: body.rating,
    });
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
