import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import { FraudService } from '@/services/fraud/fraud.service';
import prisma from '@/lib/prisma';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const fraudService = new FraudService();

const UPLOAD_DIR = join(process.cwd(), '.uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const userId = auth.user.userId;

    const contentType = request.headers.get('content-type') || '';

    // Handle multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const purpose = formData.get('purpose')?.toString() || 'general';

      if (!file) {
        return errorResponse('No file provided', 'VALIDATION_ERROR', 400);
      }

      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`, 'VALIDATION_ERROR', 400);
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return errorResponse(`File type not allowed. Allowed: PDF, TXT, MD, DOC, DOCX, PNG, JPG`, 'VALIDATION_ERROR', 400);
      }

      // Save file
      if (!existsSync(UPLOAD_DIR)) {
        mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      const ext = file.name.split('.').pop() || 'bin';
      const fileName = `${randomUUID()}.${ext}`;
      const filePath = join(UPLOAD_DIR, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      writeFileSync(filePath, buffer);

      // Create document record
      const doc = await prisma.document.create({
        data: {
          userId,
          fileName,
          originalName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          filePath,
          status: 'uploaded',
        },
      });

      // Run fraud scan on document
      let scanResult = null;
      try {
        scanResult = await fraudService.scanDocument(userId, buffer, file.name, file.type);
        await prisma.document.update({
          where: { id: doc.id },
          data: { status: 'scanned' },
        });
      } catch {
        await prisma.document.update({
          where: { id: doc.id },
          data: { status: 'upload_failed_scan' },
        });
      }

      return successResponse({
        document: {
          id: doc.id,
          originalName: doc.originalName,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          status: doc.status,
          createdAt: doc.createdAt,
        },
        scan: scanResult,
        purpose,
      });
    }

    // Handle JSON body (text paste)
    const body = await request.json();
    const { text, purpose, fileName: customName } = body as {
      text: string;
      purpose?: string;
      fileName?: string;
    };

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return errorResponse('Text content is required (minimum 10 characters)', 'VALIDATION_ERROR', 400);
    }

    if (text.length > 50000) {
      return errorResponse('Text too long. Maximum 50,000 characters.', 'VALIDATION_ERROR', 400);
    }

    // Save as text file
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const docName = customName || `pasted-${randomUUID().slice(0, 8)}.txt`;
    const fileName = `${randomUUID()}.txt`;
    const filePath = join(UPLOAD_DIR, fileName);
    writeFileSync(filePath, text);

    const doc = await prisma.document.create({
      data: {
        userId,
        fileName,
        originalName: docName,
        mimeType: 'text/plain',
        fileSize: Buffer.byteLength(text),
        filePath,
        status: 'uploaded',
      },
    });

    // Run text fraud analysis
    let scanResult = null;
    try {
      const inputType = (purpose === 'email' ? 'email' : 'text') as 'sms' | 'text' | 'email';
      scanResult = await fraudService.scanText(userId, text, inputType);
      await prisma.document.update({
        where: { id: doc.id },
        data: { status: 'scanned' },
      });
    } catch {
      await prisma.document.update({
        where: { id: doc.id },
        data: { status: 'upload_failed_scan' },
      });
    }

    return successResponse({
      document: {
        id: doc.id,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        status: doc.status,
        createdAt: doc.createdAt,
      },
      scan: scanResult,
      purpose: purpose || 'general',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Document upload failed';
    return errorResponse(message, 'UPLOAD_FAILED', 500);
  }
}
