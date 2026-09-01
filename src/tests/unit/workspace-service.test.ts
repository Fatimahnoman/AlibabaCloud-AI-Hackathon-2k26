import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  applicationWorkspace: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  applicationChecklistItem: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ default: mockPrisma }));

import { WorkspaceService } from '@/services/workspace/workspace.service';

const mockedPrisma = vi.mocked(mockPrisma);

const mockChecklistItem = (overrides: Record<string, unknown> = {}) => ({
  id: 'item-1',
  workspaceId: 'ws-1',
  label: 'Research university',
  isCompleted: false,
  dueDate: null,
  category: 'research',
  notes: null,
  order: 1,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

const mockWorkspace = (overrides: Record<string, unknown> = {}) => ({
  id: 'ws-1',
  userId: 'u1',
  entityType: 'university',
  entityId: null,
  title: 'MIT Application',
  programName: 'MS Computer Science',
  institutionName: 'MIT',
  country: 'USA',
  deadline: new Date('2025-12-01'),
  status: 'researching',
  priority: 'medium',
  notes: null,
  officialUrl: null,
  documentsJson: null,
  requirementsJson: null,
  checklistItems: [],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkspaceService();
  });

  describe('createWorkspace', () => {
    it('creates workspace with required fields', async () => {
      const rawWorkspace = mockWorkspace({ checklistItems: undefined });
      mockedPrisma.applicationWorkspace.create.mockResolvedValue(rawWorkspace as never);

      const result = await service.createWorkspace('u1', {
        entityType: 'university',
        title: 'MIT Application',
      });

      expect(result.id).toBe('ws-1');
      expect(result.title).toBe('MIT Application');
      expect(result.entityType).toBe('university');
      expect(result.status).toBe('researching');
      expect(result.priority).toBe('medium');
      expect(result.checklistItems).toEqual([]);
      expect(mockedPrisma.applicationWorkspace.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          entityType: 'university',
          entityId: null,
          title: 'MIT Application',
          programName: null,
          institutionName: null,
          country: null,
          deadline: null,
          priority: 'medium',
          officialUrl: null,
        },
      });
    });

    it('creates workspace with all optional fields', async () => {
      const deadline = new Date('2025-12-01');
      const rawWorkspace = mockWorkspace({
        deadline,
        priority: 'urgent',
        programName: 'MS Computer Science',
        institutionName: 'MIT',
        country: 'USA',
        officialUrl: 'https://mit.edu',
        entityId: 'ent-1',
        checklistItems: undefined,
      });
      mockedPrisma.applicationWorkspace.create.mockResolvedValue(rawWorkspace as never);

      const result = await service.createWorkspace('u1', {
        entityType: 'university',
        entityId: 'ent-1',
        title: 'MIT Application',
        programName: 'MS Computer Science',
        institutionName: 'MIT',
        country: 'USA',
        deadline,
        priority: 'urgent',
        officialUrl: 'https://mit.edu',
      });

      expect(result.entityId).toBe('ent-1');
      expect(result.programName).toBe('MS Computer Science');
      expect(result.institutionName).toBe('MIT');
      expect(result.country).toBe('USA');
      expect(result.deadline).toEqual(deadline);
      expect(result.priority).toBe('urgent');
      expect(result.officialUrl).toBe('https://mit.edu');
      expect(mockedPrisma.applicationWorkspace.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          entityType: 'university',
          entityId: 'ent-1',
          title: 'MIT Application',
          programName: 'MS Computer Science',
          institutionName: 'MIT',
          country: 'USA',
          deadline,
          priority: 'urgent',
          officialUrl: 'https://mit.edu',
        },
      });
    });

    it('defaults priority to medium', async () => {
      const rawWorkspace = mockWorkspace({ priority: 'medium', checklistItems: undefined });
      mockedPrisma.applicationWorkspace.create.mockResolvedValue(rawWorkspace as never);

      const result = await service.createWorkspace('u1', {
        entityType: 'scholarship',
        title: 'Fulbright',
      });

      expect(result.priority).toBe('medium');
    });
  });

  describe('getWorkspaces', () => {
    it('returns paginated workspaces for user', async () => {
      const workspaces = [mockWorkspace(), mockWorkspace({ id: 'ws-2', title: 'Stanford' })];
      mockedPrisma.applicationWorkspace.findMany.mockResolvedValue(workspaces as never);
      mockedPrisma.applicationWorkspace.count.mockResolvedValue(2);

      const result = await service.getWorkspaces('u1');

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockedPrisma.applicationWorkspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
          skip: 0,
          take: 20,
        })
      );
    });

    it('returns total count and totalPages', async () => {
      mockedPrisma.applicationWorkspace.findMany.mockResolvedValue([]);
      mockedPrisma.applicationWorkspace.count.mockResolvedValue(45);

      const result = await service.getWorkspaces('u1', { page: 2, limit: 10 });

      expect(result.total).toBe(45);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(5);
      expect(mockedPrisma.applicationWorkspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 })
      );
    });

    it('filters by status when provided', async () => {
      mockedPrisma.applicationWorkspace.findMany.mockResolvedValue([]);
      mockedPrisma.applicationWorkspace.count.mockResolvedValue(0);

      await service.getWorkspaces('u1', { status: 'submitted' });

      expect(mockedPrisma.applicationWorkspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', status: 'submitted' },
        })
      );
    });

    it('filters by entityType when provided', async () => {
      mockedPrisma.applicationWorkspace.findMany.mockResolvedValue([]);
      mockedPrisma.applicationWorkspace.count.mockResolvedValue(0);

      await service.getWorkspaces('u1', { entityType: 'scholarship' });

      expect(mockedPrisma.applicationWorkspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', entityType: 'scholarship' },
        })
      );
    });
  });

  describe('getWorkspaceById', () => {
    it('returns workspace with checklist items', async () => {
      const items = [mockChecklistItem(), mockChecklistItem({ id: 'item-2', label: 'Write SOP', order: 2 })];
      const rawWorkspace = mockWorkspace({ checklistItems: items });
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(rawWorkspace as never);

      const result = await service.getWorkspaceById('ws-1', 'u1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('ws-1');
      expect(result!.checklistItems).toHaveLength(2);
      expect(result!.checklistItems[0].label).toBe('Research university');
      expect(result!.checklistItems[1].label).toBe('Write SOP');
    });

    it('returns null when not found', async () => {
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(null);

      const result = await service.getWorkspaceById('ws-999', 'u1');

      expect(result).toBeNull();
    });

    it('returns null when userId does not match', async () => {
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(null);

      const result = await service.getWorkspaceById('ws-1', 'wrong-user');

      expect(result).toBeNull();
      expect(mockedPrisma.applicationWorkspace.findFirst).toHaveBeenCalledWith({
        where: { id: 'ws-1', userId: 'wrong-user' },
        include: { checklistItems: { orderBy: { order: 'asc' } } },
      });
    });
  });

  describe('updateWorkspace', () => {
    it('updates workspace fields', async () => {
      const rawWorkspace = mockWorkspace();
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(rawWorkspace as never);
      const updated = mockWorkspace({ title: 'Updated MIT', status: 'submitted' });
      mockedPrisma.applicationWorkspace.update.mockResolvedValue({ ...updated, checklistItems: [] } as never);

      const result = await service.updateWorkspace('ws-1', 'u1', {
        title: 'Updated MIT',
        status: 'submitted',
      });

      expect(result.title).toBe('Updated MIT');
      expect(result.status).toBe('submitted');
      expect(mockedPrisma.applicationWorkspace.update).toHaveBeenCalledWith({
        where: { id: 'ws-1' },
        data: { title: 'Updated MIT', status: 'submitted' },
        include: { checklistItems: { orderBy: { order: 'asc' } } },
      });
    });

    it('throws when workspace not found', async () => {
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(null);

      await expect(
        service.updateWorkspace('ws-999', 'u1', { title: 'Nope' })
      ).rejects.toThrow('Workspace not found');
    });

    it('allows updating status to ApplicationStatus values', async () => {
      const rawWorkspace = mockWorkspace();
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(rawWorkspace as never);
      const updated = mockWorkspace({ status: 'accepted' });
      mockedPrisma.applicationWorkspace.update.mockResolvedValue({ ...updated, checklistItems: [] } as never);

      const result = await service.updateWorkspace('ws-1', 'u1', { status: 'accepted' });

      expect(result.status).toBe('accepted');
    });
  });

  describe('deleteWorkspace', () => {
    it('deletes workspace and returns true', async () => {
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(mockWorkspace() as never);
      mockedPrisma.applicationWorkspace.delete.mockResolvedValue({} as never);

      const result = await service.deleteWorkspace('ws-1', 'u1');

      expect(result).toBe(true);
      expect(mockedPrisma.applicationWorkspace.delete).toHaveBeenCalledWith({ where: { id: 'ws-1' } });
    });

    it('returns false when not found', async () => {
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(null);

      const result = await service.deleteWorkspace('ws-999', 'u1');

      expect(result).toBe(false);
      expect(mockedPrisma.applicationWorkspace.delete).not.toHaveBeenCalled();
    });

    it('returns false when userId does not match', async () => {
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(null);

      const result = await service.deleteWorkspace('ws-1', 'wrong-user');

      expect(result).toBe(false);
    });
  });

  describe('addChecklistItem', () => {
    it('creates checklist item with order increment', async () => {
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(mockWorkspace() as never);
      mockedPrisma.applicationChecklistItem.findFirst.mockResolvedValue(mockChecklistItem({ order: 3 }) as never);
      const created = mockChecklistItem({ order: 4, label: 'Submit application' });
      mockedPrisma.applicationChecklistItem.create.mockResolvedValue(created as never);

      const result = await service.addChecklistItem('ws-1', 'u1', {
        label: 'Submit application',
      });

      expect(result.label).toBe('Submit application');
      expect(result.order).toBe(4);
      expect(result.workspaceId).toBe('ws-1');
      expect(mockedPrisma.applicationChecklistItem.create).toHaveBeenCalledWith({
        data: {
          workspaceId: 'ws-1',
          label: 'Submit application',
          dueDate: null,
          category: null,
          notes: null,
          order: 4,
        },
      });
    });

    it('throws when workspace not found', async () => {
      mockedPrisma.applicationWorkspace.findFirst.mockResolvedValue(null);

      await expect(
        service.addChecklistItem('ws-999', 'u1', { label: 'Test' })
      ).rejects.toThrow('Workspace not found');
    });
  });

  describe('updateChecklistItem', () => {
    it('updates item fields', async () => {
      const rawItem = {
        id: 'item-1',
        workspaceId: 'ws-1',
        label: 'Research university',
        isCompleted: false,
        dueDate: null,
        category: 'research',
        notes: null,
        order: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        workspace: { userId: 'u1' },
      };
      mockedPrisma.applicationChecklistItem.findFirst.mockResolvedValue(rawItem as never);
      const updatedItem = {
        ...rawItem,
        isCompleted: true,
        label: 'Done researching',
        updatedAt: new Date('2025-06-01'),
      };
      mockedPrisma.applicationChecklistItem.update.mockResolvedValue(updatedItem as never);

      const result = await service.updateChecklistItem('item-1', 'u1', {
        isCompleted: true,
        label: 'Done researching',
      });

      expect(result.isCompleted).toBe(true);
      expect(result.label).toBe('Done researching');
    });

    it('maps null dates to undefined', async () => {
      const rawItem = {
        id: 'item-1',
        workspaceId: 'ws-1',
        label: 'Test',
        isCompleted: false,
        dueDate: null,
        category: null,
        notes: null,
        order: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        workspace: { userId: 'u1' },
      };
      mockedPrisma.applicationChecklistItem.findFirst.mockResolvedValue(rawItem as never);
      mockedPrisma.applicationChecklistItem.update.mockResolvedValue(rawItem as never);

      const result = await service.updateChecklistItem('item-1', 'u1', {});

      expect(result.dueDate).toBeUndefined();
      expect(result.category).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });

    it('throws when item not found', async () => {
      mockedPrisma.applicationChecklistItem.findFirst.mockResolvedValue(null);

      await expect(
        service.updateChecklistItem('item-999', 'u1', { isCompleted: true })
      ).rejects.toThrow('Item not found');
    });
  });

  describe('deleteChecklistItem', () => {
    it('deletes item and returns true', async () => {
      const rawItem = {
        id: 'item-1',
        workspaceId: 'ws-1',
        workspace: { userId: 'u1' },
      };
      mockedPrisma.applicationChecklistItem.findFirst.mockResolvedValue(rawItem as never);
      mockedPrisma.applicationChecklistItem.delete.mockResolvedValue({} as never);

      const result = await service.deleteChecklistItem('item-1', 'u1');

      expect(result).toBe(true);
      expect(mockedPrisma.applicationChecklistItem.delete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
    });

    it('returns false when not found', async () => {
      mockedPrisma.applicationChecklistItem.findFirst.mockResolvedValue(null);

      const result = await service.deleteChecklistItem('item-999', 'u1');

      expect(result).toBe(false);
      expect(mockedPrisma.applicationChecklistItem.delete).not.toHaveBeenCalled();
    });
  });

  describe('getWorkspaceSummary', () => {
    it('returns correct counts by status', async () => {
      const workspaces = [
        mockWorkspace({ status: 'researching' }),
        mockWorkspace({ id: 'ws-2', status: 'researching' }),
        mockWorkspace({ id: 'ws-3', status: 'submitted' }),
        mockWorkspace({ id: 'ws-4', status: 'accepted', checklistItems: [mockChecklistItem({ isCompleted: true })] }),
      ];
      mockedPrisma.applicationWorkspace.findMany.mockResolvedValue(workspaces as never);

      const result = await service.getWorkspaceSummary('u1');

      expect(result.total).toBe(4);
      expect(result.byStatus.researching).toBe(2);
      expect(result.byStatus.submitted).toBe(1);
      expect(result.byStatus.accepted).toBe(1);
      expect(result.byStatus.rejected).toBe(0);
    });

    it('returns upcoming deadlines sorted by daysLeft', async () => {
      const now = new Date();
      const deadline1 = new Date(now.getTime() + 10 * 86400000);
      const deadline2 = new Date(now.getTime() + 5 * 86400000);
      const deadline3 = new Date(now.getTime() + 30 * 86400000);

      const workspaces = [
        mockWorkspace({ deadline: deadline1, title: 'MIT' }),
        mockWorkspace({ id: 'ws-2', deadline: deadline2, title: 'Stanford' }),
        mockWorkspace({ id: 'ws-3', deadline: deadline3, title: 'Oxford' }),
      ];
      mockedPrisma.applicationWorkspace.findMany.mockResolvedValue(workspaces as never);

      const result = await service.getWorkspaceSummary('u1');

      expect(result.upcomingDeadlines).toHaveLength(3);
      expect(result.upcomingDeadlines[0].daysLeft).toBeLessThanOrEqual(result.upcomingDeadlines[1].daysLeft);
      expect(result.upcomingDeadlines[1].daysLeft).toBeLessThanOrEqual(result.upcomingDeadlines[2].daysLeft);
    });

    it('calculates overall progress percentage', async () => {
      const workspaces = [
        mockWorkspace({
          checklistItems: [
            mockChecklistItem({ isCompleted: true }),
            mockChecklistItem({ id: 'item-2', isCompleted: true }),
            mockChecklistItem({ id: 'item-3', isCompleted: false }),
          ],
        }),
      ];
      mockedPrisma.applicationWorkspace.findMany.mockResolvedValue(workspaces as never);

      const result = await service.getWorkspaceSummary('u1');

      expect(result.overallProgress).toBe(67);
    });

    it('returns empty summary when no workspaces', async () => {
      mockedPrisma.applicationWorkspace.findMany.mockResolvedValue([]);

      const result = await service.getWorkspaceSummary('u1');

      expect(result.total).toBe(0);
      expect(result.overallProgress).toBe(0);
      expect(result.upcomingDeadlines).toEqual([]);
      expect(result.byStatus.researching).toBe(0);
      expect(result.byStatus.submitted).toBe(0);
    });
  });

  describe('getDefaultChecklist', () => {
    it('returns university checklist (13 items)', async () => {
      const result = await service.getDefaultChecklist('university', 'MIT');

      expect(result).toHaveLength(13);
      expect(result[0].label).toBe('Research university and program');
      expect(result[0].category).toBe('research');
      expect(result[8].label).toBe('Submit application');
      expect(result[8].category).toBe('submission');
    });

    it('returns scholarship checklist (7 items)', async () => {
      const result = await service.getDefaultChecklist('scholarship', 'Fulbright');

      expect(result).toHaveLength(7);
      expect(result[0].label).toBe('Check eligibility criteria');
      expect(result[6].label).toBe('Submit before deadline');
    });

    it('returns generic checklist for other types', async () => {
      const result = await service.getDefaultChecklist('course', 'Web Dev Bootcamp');

      expect(result).toHaveLength(3);
      expect(result[0].label).toBe('Research program requirements');
      expect(result[2].label).toBe('Submit application');
    });
  });
});
