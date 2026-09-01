import prisma from '@/lib/prisma';
import { unlinkSync, existsSync } from 'fs';

export class DocumentService {
  async upload(userId: string, fileName: string, originalName: string, mimeType: string, fileSize: number, filePath: string) {
    const doc = await prisma.document.create({
      data: {
        userId,
        fileName,
        originalName,
        mimeType,
        fileSize,
        filePath,
        status: 'uploaded',
      },
    });
    return doc;
  }

  async getDocument(documentId: string, userId: string) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId, deletedAt: null },
      include: { scans: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
    return doc;
  }

  async getUserDocuments(userId: string, options?: { page?: number; limit?: number; status?: string }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId, deletedAt: null };
    if (options?.status) where.status = options.status;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { scans: { take: 1, orderBy: { createdAt: 'desc' } } },
      }),
      prisma.document.count({ where }),
    ]);

    return { documents, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(documentId: string, status: string) {
    return prisma.document.update({
      where: { id: documentId },
      data: { status },
    });
  }

  async scanDocument(documentId: string) {
    const scan = await prisma.documentScan.findFirst({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
    return scan;
  }

  async deleteDocument(documentId: string, userId: string) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId, deletedAt: null },
    });

    if (!doc) throw new Error('Document not found');

    // Soft delete
    await prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });

    // Try to remove physical file
    if (doc.filePath && existsSync(doc.filePath)) {
      try {
        unlinkSync(doc.filePath);
      } catch {
        // File removal is best-effort
      }
    }
  }

  async getStats(userId: string) {
    const [total, byStatus] = await Promise.all([
      prisma.document.count({ where: { userId, deletedAt: null } }),
      prisma.document.groupBy({
        by: ['status'],
        where: { userId, deletedAt: null },
        _count: true,
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const s of byStatus) {
      statusCounts[s.status] = s._count;
    }

    return { total, byStatus: statusCounts };
  }
}

export const documentService = new DocumentService();
