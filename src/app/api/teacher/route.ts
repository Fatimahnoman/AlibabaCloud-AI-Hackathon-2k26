import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { teacherService } from '@/services/teacher/teacher.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;

    const profile = await teacherService.getTeacherProfile(auth.user.userId);
    return successResponse(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'PROFILE_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, 'teacher');
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const profile = await teacherService.createTeacherProfile(auth.user.userId, body);
    return successResponse(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'PROFILE_CREATE_FAILED', 500);
  }
}
