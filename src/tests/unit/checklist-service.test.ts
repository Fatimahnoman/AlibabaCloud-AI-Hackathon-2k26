import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationChecklistService } from '@/services/education/checklist.service';

vi.mock('@/lib/prisma', () => {
  const mock = {
    applicationChecklist: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
const mockedPrisma = vi.mocked(prisma);

describe('ApplicationChecklistService', () => {
  let service: ApplicationChecklistService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ApplicationChecklistService();
  });

  describe('createChecklist', () => {
    it('creates with default items', async () => {
      const defaultItems = service.getDefaultChecklistItems();
      const created = {
        id: 'cl-001',
        userId: 'u1',
        title: 'My Application',
        universityId: null,
        scholarshipId: null,
        status: 'in_progress',
        items: JSON.stringify(defaultItems),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockedPrisma.applicationChecklist.create.mockResolvedValue(created as never);

      const result = await service.createChecklist('u1', 'My Application');

      expect(result.id).toBe('cl-001');
      expect(result.items).toEqual(defaultItems);
      expect(mockedPrisma.applicationChecklist.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          title: 'My Application',
          universityId: null,
          scholarshipId: null,
          items: JSON.stringify(defaultItems),
        },
      });
    });

    it('passes university and scholarship ids', async () => {
      mockedPrisma.applicationChecklist.create.mockResolvedValue({
        id: 'cl-001',
        items: '[]',
      } as never);

      await service.createChecklist('u1', 'Test', 'uni-001', 'sch-001');

      expect(mockedPrisma.applicationChecklist.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          title: 'Test',
          universityId: 'uni-001',
          scholarshipId: 'sch-001',
          items: expect.any(String),
        },
      });
    });
  });

  describe('getChecklists', () => {
    it('returns user checklists with parsed items', async () => {
      const defaultItems = service.getDefaultChecklistItems();
      const checklists = [
        {
          id: 'cl-001',
          userId: 'u1',
          title: 'My Application',
          items: JSON.stringify(defaultItems),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockedPrisma.applicationChecklist.findMany.mockResolvedValue(checklists as never);

      const result = await service.getChecklists('u1');

      expect(result).toHaveLength(1);
      expect(result[0].items).toEqual(defaultItems);
      expect(mockedPrisma.applicationChecklist.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateChecklist', () => {
    it('updates items', async () => {
      const existing = {
        id: 'cl-001',
        userId: 'u1',
        title: 'My Application',
        items: '[]',
      };
      mockedPrisma.applicationChecklist.findFirst.mockResolvedValue(existing as never);

      const items = [
        { id: 'item-1', label: 'Test', category: 'docs', completed: false },
      ];
      const updated = {
        id: 'cl-001',
        userId: 'u1',
        title: 'My Application',
        status: 'in_progress',
        items: JSON.stringify(items),
      };
      mockedPrisma.applicationChecklist.update.mockResolvedValue(updated as never);

      const result = await service.updateChecklist('u1', 'cl-001', items);

      expect(result.items).toEqual(items);
      expect(mockedPrisma.applicationChecklist.update).toHaveBeenCalledWith({
        where: { id: 'cl-001' },
        data: {
          items: JSON.stringify(items),
          status: 'in_progress',
        },
      });
    });

    it('sets status to completed when all items done', async () => {
      mockedPrisma.applicationChecklist.findFirst.mockResolvedValue({ id: 'cl-001', userId: 'u1' } as never);
      mockedPrisma.applicationChecklist.update.mockResolvedValue({
        id: 'cl-001',
        status: 'completed',
        items: '[]',
      } as never);

      const items = [
        { id: 'item-1', label: 'Test', category: 'docs', completed: true },
        { id: 'item-2', label: 'Test2', category: 'docs', completed: true },
      ];

      await service.updateChecklist('u1', 'cl-001', items);

      expect(mockedPrisma.applicationChecklist.update).toHaveBeenCalledWith({
        where: { id: 'cl-001' },
        data: {
          items: JSON.stringify(items),
          status: 'completed',
        },
      });
    });

    it('throws on missing checklist', async () => {
      mockedPrisma.applicationChecklist.findFirst.mockResolvedValue(null);

      await expect(
        service.updateChecklist('u1', 'nonexistent', []),
      ).rejects.toThrow('Checklist with id "nonexistent" not found for this user');
    });
  });

  describe('deleteChecklist', () => {
    it('removes checklist', async () => {
      mockedPrisma.applicationChecklist.findFirst.mockResolvedValue({ id: 'cl-001', userId: 'u1' } as never);
      mockedPrisma.applicationChecklist.delete.mockResolvedValue({} as never);

      await service.deleteChecklist('u1', 'cl-001');

      expect(mockedPrisma.applicationChecklist.delete).toHaveBeenCalledWith({
        where: { id: 'cl-001' },
      });
    });

    it('throws on missing checklist', async () => {
      mockedPrisma.applicationChecklist.findFirst.mockResolvedValue(null);

      await expect(service.deleteChecklist('u1', 'nonexistent')).rejects.toThrow(
        'Checklist with id "nonexistent" not found for this user',
      );
    });
  });

  describe('getDefaultChecklistItems', () => {
    it('returns standard items', () => {
      const items = service.getDefaultChecklistItems();

      expect(items).toHaveLength(15);
      expect(items.every((item) => item.id && item.label && item.category)).toBe(true);
      expect(items.every((item) => item.completed === false)).toBe(true);

      const categories = [...new Set(items.map((i) => i.category))];
      expect(categories).toContain('research');
      expect(categories).toContain('eligibility');
      expect(categories).toContain('documents');
      expect(categories).toContain('financial');
      expect(categories).toContain('submission');
      expect(categories).toContain('visa');
      expect(categories).toContain('logistics');
    });
  });
});
