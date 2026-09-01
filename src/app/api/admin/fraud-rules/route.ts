import { NextRequest } from 'next/server';
import { requireRole, getClientInfo } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { AdminService } from '@/services/admin/admin.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new AdminService({ userId: auth.user.userId, ...clientInfo });

    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam !== null ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam !== null ? parseInt(limitParam, 10) : undefined;

    if (page !== undefined && (isNaN(page) || page < 1)) {
      return errorResponse('Invalid page parameter', 'VALIDATION_ERROR', 400);
    }
    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      return errorResponse('Invalid limit parameter, must be between 1 and 100', 'VALIDATION_ERROR', 400);
    }

    const result = await admin.listFraudRules({
      page,
      limit,
      ruleType: searchParams.get('ruleType') || undefined,
      severity: searchParams.get('severity') || undefined,
      enabled: searchParams.get('enabled') === null ? undefined : searchParams.get('enabled') === 'true',
    });
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'INTERNAL_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, 'admin');
    if ('error' in auth) return auth.error;
    const clientInfo = getClientInfo(request);
    const admin = new AdminService({ userId: auth.user.userId, ...clientInfo });

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400);
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return errorResponse('Request body must be a JSON object', 'VALIDATION_ERROR', 400);
    }

    const requiredFields = ['name', 'ruleType', 'pattern', 'severity', 'score'] as const;
    for (const field of requiredFields) {
      if (typeof body[field] === 'undefined' || body[field] === null) {
        return errorResponse(`Missing required field: ${field}`, 'VALIDATION_ERROR', 400);
      }
    }
    for (const field of ['name', 'ruleType', 'pattern', 'severity'] as const) {
      if (typeof body[field] !== 'string' || (body[field] as string).trim().length === 0) {
        return errorResponse(`${field} must be a non-empty string`, 'VALIDATION_ERROR', 400);
      }
    }
    if (typeof body.score !== 'number' || !Number.isInteger(body.score) || body.score < 0 || body.score > 100) {
      return errorResponse('score must be an integer between 0 and 100', 'VALIDATION_ERROR', 400);
    }
    if (typeof body.description !== 'undefined' && typeof body.description !== 'string') {
      return errorResponse('description must be a string', 'VALIDATION_ERROR', 400);
    }
    if (typeof body.category !== 'undefined' && typeof body.category !== 'string') {
      return errorResponse('category must be a string', 'VALIDATION_ERROR', 400);
    }
    if (typeof body.reason !== 'undefined' && typeof body.reason !== 'string') {
      return errorResponse('reason must be a string', 'VALIDATION_ERROR', 400);
    }

    const created = await admin.createFraudRule(
      {
        name: body.name as string,
        ruleType: body.ruleType as string,
        pattern: body.pattern as string,
        severity: body.severity as string,
        score: body.score as number,
        description: typeof body.description === 'string' ? body.description : undefined,
        category: typeof body.category === 'string' ? body.category : undefined,
      },
      typeof body.reason === 'string' ? body.reason : undefined
    );
    return successResponse(created, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'INTERNAL_ERROR', 500);
  }
}
