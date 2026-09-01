import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { studentAssistantService } from '@/services/student-assistant/student-assistant.service';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const summary = await studentAssistantService.getDashboardSummary(auth.user.userId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Student assistant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
