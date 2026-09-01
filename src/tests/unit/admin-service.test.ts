import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  dataChangeLog: {
    create: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  university: {
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  scholarship: {
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  source: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  fraudRule: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  countryProfile: {
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  countryVisaSource: {
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  countryReportingAuthority: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  verificationLog: { deleteMany: vi.fn() },
  sourceSnapshot: { deleteMany: vi.fn() },
  user: { findMany: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/lib/prisma', () => ({ default: mockPrisma }));

import { AuditTrailService } from '@/services/admin/audit-trail.service';
import { AdminService } from '@/services/admin/admin.service';

const adminCtx = { userId: 'admin-1', ipAddress: '127.0.0.1', userAgent: 'test' };

describe('AuditTrailService', () => {
  let service: AuditTrailService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuditTrailService();
  });

  it('logs a change with all fields', async () => {
    await service.logChange({
      userId: 'user-1',
      action: 'UPDATE',
      entityType: 'university',
      entityId: 'uni-1',
      entityName: 'MIT',
      oldValue: { name: 'MIT' },
      newValue: { name: 'MIT Updated' },
      reason: 'Name correction',
    });
    expect(mockPrisma.dataChangeLog.create).toHaveBeenCalledOnce();
    const call = mockPrisma.dataChangeLog.create.mock.calls[0][0].data;
    expect(call.action).toBe('UPDATE');
    expect(call.entityType).toBe('university');
    expect(call.entityName).toBe('MIT');
    expect(call.reason).toBe('Name correction');
  });

  it('returns paginated change logs', async () => {
    mockPrisma.dataChangeLog.findMany.mockResolvedValue([]);
    mockPrisma.dataChangeLog.count.mockResolvedValue(0);
    const result = await service.getChangeLogs({ page: 1, limit: 10 });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('returns entity history', async () => {
    mockPrisma.dataChangeLog.findMany.mockResolvedValue([]);
    const result = await service.getEntityHistory('university', 'uni-1');
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns recent changes', async () => {
    mockPrisma.dataChangeLog.findMany.mockResolvedValue([]);
    const result = await service.getRecentChanges(5);
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns stats', async () => {
    mockPrisma.dataChangeLog.count.mockResolvedValue(10);
    mockPrisma.dataChangeLog.groupBy.mockResolvedValue([]);
    const result = await service.getStats();
    expect(result.totalChanges).toBe(10);
    expect(result.changesToday).toBe(10);
  });
});

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminService(adminCtx);
  });

  it('returns dashboard stats', async () => {
    mockPrisma.university.count.mockResolvedValue(10);
    mockPrisma.scholarship.count.mockResolvedValue(5);
    mockPrisma.source.count.mockResolvedValue(3);
    mockPrisma.fraudRule.count.mockResolvedValue(2);
    mockPrisma.countryProfile.count.mockResolvedValue(38);
    mockPrisma.dataChangeLog.count.mockResolvedValue(0);
    const stats = await service.getDashboardStats();
    expect(stats.universities).toBe(10);
    expect(stats.countries).toBe(38);
  });

  it('lists universities with pagination', async () => {
    mockPrisma.university.findMany.mockResolvedValue([]);
    mockPrisma.university.count.mockResolvedValue(0);
    const result = await service.listUniversities({ page: 1, limit: 10 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('updates university with audit trail', async () => {
    const old = { id: 'uni-1', name: 'Old Name', country: 'US' };
    const updated = { id: 'uni-1', name: 'New Name', country: 'US' };
    mockPrisma.university.findUnique.mockResolvedValue(old);
    mockPrisma.university.update.mockResolvedValue(updated);
    const result = await service.updateUniversity('uni-1', { name: 'New Name' }, 'Rebranding');
    expect(result).toEqual(updated);
    expect(mockPrisma.dataChangeLog.create).toHaveBeenCalledOnce();
  });

  it('returns null when university not found', async () => {
    mockPrisma.university.findUnique.mockResolvedValue(null);
    const result = await service.updateUniversity('not-found', { name: 'X' });
    expect(result).toBeNull();
  });

  it('lists and updates scholarships', async () => {
    mockPrisma.scholarship.findMany.mockResolvedValue([]);
    mockPrisma.scholarship.count.mockResolvedValue(0);
    await service.listScholarships();
    expect(mockPrisma.scholarship.findMany).toHaveBeenCalled();
  });

  it('updates source with audit trail', async () => {
    const old = { id: 'src-1', sourceName: 'Old', sourceUrl: 'http://old.com', verificationStatus: 'pending' };
    const updated = { ...old, verificationStatus: 'verified' };
    mockPrisma.source.findUnique.mockResolvedValue(old);
    mockPrisma.source.update.mockResolvedValue(updated);
    const result = await service.updateSource('src-1', { verificationStatus: 'verified' }, 'Verified manually');
    expect(result).toEqual(updated);
    expect(mockPrisma.dataChangeLog.create).toHaveBeenCalledOnce();
  });

  it('deletes source with audit trail', async () => {
    const old = { id: 'src-1', sourceName: 'Test', sourceUrl: 'http://test.com' };
    mockPrisma.source.findUnique.mockResolvedValue(old);
    mockPrisma.source.delete.mockResolvedValue(old);
    const result = await service.deleteSource('src-1', 'No longer needed');
    expect(result).toBe(true);
    expect(mockPrisma.dataChangeLog.create).toHaveBeenCalledOnce();
    expect(mockPrisma.verificationLog.deleteMany).toHaveBeenCalledWith({ where: { sourceId: 'src-1' } });
  });

  it('creates fraud rule with audit trail', async () => {
    const created = { id: 'rule-1', name: 'Test Rule', ruleType: 'keyword', pattern: 'urgent', severity: 'high', score: 80 };
    mockPrisma.fraudRule.create.mockResolvedValue(created);
    const result = await service.createFraudRule({
      name: 'Test Rule', ruleType: 'keyword', pattern: 'urgent', severity: 'high', score: 80,
    }, 'New fraud rule');
    expect(result).toEqual(created);
    expect(mockPrisma.dataChangeLog.create).toHaveBeenCalledOnce();
  });

  it('updates fraud rule with audit trail', async () => {
    const old = { id: 'rule-1', name: 'Old', ruleType: 'keyword', pattern: 'x', severity: 'low', score: 20 };
    const updated = { ...old, severity: 'high', score: 80 };
    mockPrisma.fraudRule.findUnique.mockResolvedValue(old);
    mockPrisma.fraudRule.update.mockResolvedValue(updated);
    const result = await service.updateFraudRule('rule-1', { severity: 'high', score: 80 }, 'Escalating');
    expect(result).toEqual(updated);
  });

  it('deletes fraud rule with audit trail', async () => {
    const old = { id: 'rule-1', name: 'Delete Me', ruleType: 'keyword', pattern: 'x', severity: 'low', score: 10 };
    mockPrisma.fraudRule.findUnique.mockResolvedValue(old);
    mockPrisma.fraudRule.delete.mockResolvedValue(old);
    const result = await service.deleteFraudRule('rule-1', 'Obsolete rule');
    expect(result).toBe(true);
  });

  it('lists countries with pagination', async () => {
    mockPrisma.countryProfile.findMany.mockResolvedValue([]);
    mockPrisma.countryProfile.count.mockResolvedValue(0);
    const result = await service.listCountries({ search: 'US' });
    expect(result.items).toEqual([]);
  });

  it('updates country with audit trail', async () => {
    const old = { id: 'c-1', name: 'Pakistan', code: 'PK' };
    const updated = { ...old, name: 'Islamic Republic of Pakistan' };
    mockPrisma.countryProfile.findUnique.mockResolvedValue(old);
    mockPrisma.countryProfile.update.mockResolvedValue(updated);
    const result = await service.updateCountry('c-1', { name: 'Islamic Republic of Pakistan' }, 'Official name update');
    expect(result).toEqual(updated);
  });

  it('lists visa sources', async () => {
    mockPrisma.countryVisaSource.findMany.mockResolvedValue([]);
    mockPrisma.countryVisaSource.count.mockResolvedValue(0);
    await service.listVisaSources({ countryCode: 'PK' });
    expect(mockPrisma.countryVisaSource.findMany).toHaveBeenCalled();
  });

  it('lists cyber authorities', async () => {
    mockPrisma.countryReportingAuthority.findMany.mockResolvedValue([]);
    mockPrisma.countryReportingAuthority.count.mockResolvedValue(0);
    await service.listCyberAuthorities({ countryCode: 'PK' });
    expect(mockPrisma.countryReportingAuthority.findMany).toHaveBeenCalled();
  });

  it('returns audit trail for entity', async () => {
    mockPrisma.dataChangeLog.findMany.mockResolvedValue([]);
    const result = await service.getEntityAuditTrail('university', 'uni-1');
    expect(Array.isArray(result)).toBe(true);
  });
});
