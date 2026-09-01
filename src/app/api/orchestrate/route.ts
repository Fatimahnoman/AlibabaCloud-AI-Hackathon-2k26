import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { orchestratorService } from '@/services/orchestration/orchestrator.service';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const isMultiDomain = orchestratorService.isMultiDomainQuery(message);
    
    const query = {
      userId: auth.user.userId,
      message,
      domains: [],
      entities: {},
    };

    const result = await orchestratorService.orchestrate(query);
    const aiFormattedResult = orchestratorService.formatResultAsAIContext(result);

    return NextResponse.json({
      result,
      formattedMessage: aiFormattedResult,
      isMultiDomain,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error('Orchestration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
