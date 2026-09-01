import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, code: string, status = 400, details?: Record<string, string>): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message, code, details }, { status });
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, 'UNAUTHORIZED', 401);
}

export function forbiddenResponse(message = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse(message, 'FORBIDDEN', 403);
}

export function notFoundResponse(message = 'Not found'): NextResponse<ApiResponse> {
  return errorResponse(message, 'NOT_FOUND', 404);
}

export function internalErrorResponse(message = 'Internal server error'): NextResponse<ApiResponse> {
  return errorResponse(message, 'INTERNAL_ERROR', 500);
}

export function rateLimitResponse(): NextResponse<ApiResponse> {
  return errorResponse('Too many requests', 'RATE_LIMITED', 429);
}
