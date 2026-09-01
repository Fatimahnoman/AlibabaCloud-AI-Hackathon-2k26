import prisma from '@/lib/prisma';
import { auditTrailService } from './audit-trail.service';

interface AdminContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AdminService {
  private ctx: AdminContext;

  constructor(ctx: AdminContext) {
    this.ctx = ctx;
  }

  private async log(entityType: string, entityId: string, action: 'CREATE' | 'UPDATE' | 'DELETE', oldValue: Record<string, unknown> | null, newValue: Record<string, unknown> | null, entityName?: string, reason?: string) {
    await auditTrailService.logChange({
      userId: this.ctx.userId,
      action,
      entityType,
      entityId,
      entityName,
      oldValue,
      newValue,
      reason,
      ipAddress: this.ctx.ipAddress,
      userAgent: this.ctx.userAgent,
    });
  }

  async listUniversities(filters: { page?: number; limit?: number; country?: string; search?: string } = {}) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.country) where.country = filters.country;
    if (filters.search) where.name = { contains: filters.search };
    const [items, total] = await Promise.all([
      prisma.university.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      prisma.university.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUniversity(id: string, data: Record<string, unknown>, reason?: string) {
    const old = await prisma.university.findUnique({ where: { id } });
    if (!old) return null;
    const updated = await prisma.university.update({ where: { id }, data });
    await this.log('university', id, 'UPDATE', old as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>, old.name, reason);
    return updated;
  }

  async listScholarships(filters: { page?: number; limit?: number; country?: string; search?: string } = {}) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.country) where.country = filters.country;
    if (filters.search) where.name = { contains: filters.search };
    const [items, total] = await Promise.all([
      prisma.scholarship.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      prisma.scholarship.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateScholarship(id: string, data: Record<string, unknown>, reason?: string) {
    const old = await prisma.scholarship.findUnique({ where: { id } });
    if (!old) return null;
    const updated = await prisma.scholarship.update({ where: { id }, data });
    await this.log('scholarship', id, 'UPDATE', old as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>, old.name, reason);
    return updated;
  }

  async listSources(filters: { page?: number; limit?: number; entityType?: string; status?: string } = {}) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.status) where.verificationStatus = filters.status;
    const [items, total] = await Promise.all([
      prisma.source.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.source.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateSource(id: string, data: Record<string, unknown>, reason?: string) {
    const old = await prisma.source.findUnique({ where: { id } });
    if (!old) return null;
    const updated = await prisma.source.update({ where: { id }, data });
    await this.log('source', id, 'UPDATE', old as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>, old.sourceName || old.sourceUrl, reason);
    return updated;
  }

  async deleteSource(id: string, reason?: string) {
    const old = await prisma.source.findUnique({ where: { id } });
    if (!old) return false;
    await prisma.verificationLog.deleteMany({ where: { sourceId: id } });
    await prisma.sourceSnapshot.deleteMany({ where: { sourceId: id } });
    await prisma.source.delete({ where: { id } });
    await this.log('source', id, 'DELETE', old as unknown as Record<string, unknown>, null, old.sourceName || old.sourceUrl, reason);
    return true;
  }

  async listFraudRules(filters: { page?: number; limit?: number; ruleType?: string; enabled?: boolean; severity?: string } = {}) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.ruleType) where.ruleType = filters.ruleType;
    if (filters.enabled !== undefined) where.enabled = filters.enabled;
    if (filters.severity) where.severity = filters.severity;
    const [items, total] = await Promise.all([
      prisma.fraudRule.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      prisma.fraudRule.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createFraudRule(data: { name: string; ruleType: string; pattern: string; severity: string; score: number; description?: string; category?: string }, reason?: string) {
    const created = await prisma.fraudRule.create({ data });
    await this.log('fraud_rule', created.id, 'CREATE', null, created as unknown as Record<string, unknown>, created.name, reason);
    return created;
  }

  async updateFraudRule(id: string, data: Record<string, unknown>, reason?: string) {
    const old = await prisma.fraudRule.findUnique({ where: { id } });
    if (!old) return null;
    const updated = await prisma.fraudRule.update({ where: { id }, data });
    await this.log('fraud_rule', id, 'UPDATE', old as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>, old.name, reason);
    return updated;
  }

  async deleteFraudRule(id: string, reason?: string) {
    const old = await prisma.fraudRule.findUnique({ where: { id } });
    if (!old) return false;
    await prisma.fraudRule.delete({ where: { id } });
    await this.log('fraud_rule', id, 'DELETE', old as unknown as Record<string, unknown>, null, old.name, reason);
    return true;
  }

  async listCountries(filters: { page?: number; limit?: number; search?: string } = {}) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.search) where.OR = [{ name: { contains: filters.search } }, { code: { contains: filters.search } }];
    const [items, total] = await Promise.all([
      prisma.countryProfile.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      prisma.countryProfile.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateCountry(id: string, data: Record<string, unknown>, reason?: string) {
    const old = await prisma.countryProfile.findUnique({ where: { id } });
    if (!old) return null;
    const updated = await prisma.countryProfile.update({ where: { id }, data });
    await this.log('country', id, 'UPDATE', old as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>, old.name, reason);
    return updated;
  }

  async listVisaSources(filters: { page?: number; limit?: number; countryCode?: string } = {}) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.countryCode) where.countryCode = filters.countryCode;
    const [items, total] = await Promise.all([
      prisma.countryVisaSource.findMany({ where, orderBy: { sourceName: 'asc' }, skip, take: limit }),
      prisma.countryVisaSource.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateVisaSource(id: string, data: Record<string, unknown>, reason?: string) {
    const old = await prisma.countryVisaSource.findUnique({ where: { id } });
    if (!old) return null;
    const updated = await prisma.countryVisaSource.update({ where: { id }, data });
    await this.log('visa_source', id, 'UPDATE', old as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>, old.sourceName, reason);
    return updated;
  }

  async listCyberAuthorities(filters: { page?: number; limit?: number; countryCode?: string } = {}) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.countryCode) where.countryCode = filters.countryCode;
    const [items, total] = await Promise.all([
      prisma.countryReportingAuthority.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      prisma.countryReportingAuthority.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDashboardStats() {
    const [universities, scholarships, sources, fraudRules, countries, changeLogs] = await Promise.all([
      prisma.university.count(),
      prisma.scholarship.count(),
      prisma.source.count(),
      prisma.fraudRule.count(),
      prisma.countryProfile.count(),
      prisma.dataChangeLog.count(),
    ]);
    return { universities, scholarships, sources, fraudRules, countries, changeLogs };
  }

  async getAuditTrail(filters: { entityType?: string; entityId?: string; userId?: string; action?: string; page?: number; limit?: number }) {
    return auditTrailService.getChangeLogs(filters);
  }

  async getEntityAuditTrail(entityType: string, entityId: string) {
    return auditTrailService.getEntityHistory(entityType, entityId);
  }
}
