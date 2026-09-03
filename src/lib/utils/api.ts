import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

function getErrorMessage(message: string, code: string): string {
  if (process.env.NODE_ENV === 'production') {
    const safeMessages: Record<string, string> = {
      'UNAUTHORIZED': 'Authentication required',
      'FORBIDDEN': 'Access denied',
      'NOT_FOUND': 'Resource not found',
      'VALIDATION_ERROR': 'Invalid input',
      'RATE_LIMITED': 'Too many requests',
      'CSRF_FAILED': 'Session invalid',
      'PAYLOAD_TOO_LARGE': 'Request too large',
      'LOGIN_FAILED': 'Invalid credentials',
      'INTERNAL_ERROR': 'Server error',
    };
    return safeMessages[code] || 'An error occurred';
  }
  return message;
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, code: string, status = 400, details?: Record<string, string>): NextResponse<ApiResponse> {
  const safeMessage = getErrorMessage(message, code);
  return NextResponse.json({ success: false, message: safeMessage, code, details }, { status });
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
