import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { studyService } from '@/services/study/study.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const subject = request.nextUrl.searchParams.get('subject') ?? undefined;
    const topics = await studyService.getStudyTopics(auth.user.userId, subject);
    return NextResponse.json({ success: true, data: topics });
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
    const topic = await studyService.upsertStudyTopic(
      auth.user.userId,
      body.subject,
      body.topic,
      body.priority
    );
    return NextResponse.json({ success: true, data: topic }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
