import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { fraudService } from '@/services/fraud/fraud.service';

// Extend timeout for document scanning
export const maxDuration = 30;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return errorResponse('No file provided', 'NO_FILE', 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse('File type not allowed', 'INVALID_FILE_TYPE', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File size exceeds 10MB limit', 'FILE_TOO_LARGE', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await fraudService.scanDocument(auth.user.userId, buffer, file.name, file.type);
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'DOCUMENT_SCAN_FAILED', 500);
  }
}
