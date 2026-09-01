import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { metricsCollector } from '@/lib/monitoring';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const metrics = metricsCollector.getMetrics();
    return successResponse(metrics);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get metrics';
    return errorResponse(message, 'METRICS_ERROR', 500);
  }
}
