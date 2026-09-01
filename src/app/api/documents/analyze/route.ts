import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { documentIntelligenceService } from '@/services/document-intelligence/document-intelligence.service';

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'txt' || ext === 'md') {
    return await file.text();
  }

  if (ext === 'pdf') {
    const buffer = Buffer.from(await file.arrayBuffer());
    const textChunks: string[] = [];
    const str = buffer.toString('latin1');
    const matches = str.match(/BT[\s\S]*?ET/g);
    if (matches) {
      for (const m of matches) {
        const texts = m.match(/\(([^)]+)\)/g);
        if (texts) {
          textChunks.push(...texts.map(t => t.slice(1, -1)));
        }
      }
    }
    return textChunks.join(' ') || '[PDF content — could not extract text. Please paste the text manually.]';
  }

  if (ext === 'docx') {
    const buffer = Buffer.from(await file.arrayBuffer());
    const str = buffer.toString('utf-8');
    const texts: string[] = [];
    const matches = str.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (matches) {
      for (const m of matches) {
        const inner = m.replace(/<[^>]+>/g, '');
        texts.push(inner);
      }
    }
    return texts.join(' ') || '[DOCX content — could not extract text. Please paste the text manually.]';
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = Buffer.from(await file.arrayBuffer());
    const str = buffer.toString('utf-8');
    const texts: string[] = [];
    const matches = str.match(/<v:t[^>]*>([^<]+)<\/v:t>/g);
    if (matches) {
      for (const m of matches) {
        texts.push(m.replace(/<[^>]+>/g, ''));
      }
    }
    return texts.join(' ') || '[Excel content — could not extract text. Please paste the text manually.]';
  }

  return '[Unsupported file format]';
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const contentType = request.headers.get('content-type') || '';
    let content = '';
    let documentType = '';
    let targetInstitution = '';
    let targetProgram = '';
    let additionalContext = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      documentType = (formData.get('documentType') as string) || '';
      targetInstitution = (formData.get('targetInstitution') as string) || '';
      targetProgram = (formData.get('targetProgram') as string) || '';
      additionalContext = (formData.get('additionalContext') as string) || '';

      if (file) {
        content = await extractTextFromFile(file);
      }
    } else {
      const body = await request.json();
      content = body.content || '';
      documentType = body.documentType || '';
      targetInstitution = body.targetInstitution || '';
      targetProgram = body.targetProgram || '';
      additionalContext = body.additionalContext || '';
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return errorResponse('Content is required', 'CONTENT_REQUIRED', 400);
    }

    if (!documentType || typeof documentType !== 'string') {
      return errorResponse('Document type is required', 'DOCUMENT_TYPE_REQUIRED', 400);
    }

    const result = await documentIntelligenceService.analyzeDocument(
      auth.user.userId,
      content.trim(),
      request,
      { documentType, targetInstitution, targetProgram, additionalContext }
    );

    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'ANALYSIS_FAILED', 500);
  }
}
