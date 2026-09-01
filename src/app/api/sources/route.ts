import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { sourceService } from '@/services/sources/source.service';
import { isSafeUrl } from '@/lib/ssrf-protection';
import { errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const entityType = request.nextUrl.searchParams.get('entityType');
    const entityId = request.nextUrl.searchParams.get('entityId');

    if (entityType && entityId) {
      const sources = await sourceService.getSourcesForEntity(entityType, entityId);
      return NextResponse.json({ success: true, data: sources });
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const result = await sourceService.getUnverifiedSources({ page, limit });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { entityType, entityId, sourceUrl, sourceName, sourceType } = body;

    if (!entityType || !entityId || !sourceUrl || !sourceName || !sourceType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: entityType, entityId, sourceUrl, sourceName, sourceType' },
        { status: 400 }
      );
    }

    if (body.sourceUrl && !isSafeUrl(body.sourceUrl)) {
      return errorResponse('Invalid source URL', 'VALIDATION_ERROR', 400);
    }

    const source = await sourceService.recordSource({
      entityType,
      entityId,
      sourceUrl,
      sourceName,
      sourceType,
    });

    return NextResponse.json({ success: true, data: source }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
