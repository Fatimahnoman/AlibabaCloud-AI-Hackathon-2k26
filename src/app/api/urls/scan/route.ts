import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { FraudService } from '@/services/fraud/fraud.service';

const fraudService = new FraudService();

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { url } = body as { url: string };

    if (!url || typeof url !== 'string') {
      return errorResponse('URL is required', 'VALIDATION_ERROR', 400);
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Basic URL validation
    try {
      new URL(normalizedUrl);
    } catch {
      return errorResponse('Invalid URL format', 'VALIDATION_ERROR', 400);
    }

    const result = await fraudService.scanUrl(auth.user.userId, normalizedUrl);
    return successResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('SSRF')) {
      return errorResponse('URL blocked: potential security risk', 'SSRF_BLOCKED', 403);
    }
    const message = error instanceof Error ? error.message : 'URL scan failed';
    return errorResponse(message, 'URL_SCAN_FAILED', 500);
  }
}
