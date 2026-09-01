import prisma from '@/lib/prisma';
import type { ApplicationWorkspace, ApplicationChecklistItem, WorkspaceSummary, ApplicationStatus, ApplicationPriority } from '@/types/education';

export class WorkspaceService {
  async createWorkspace(userId: string, data: {
    entityType: string;
    entityId?: string;
    title: string;
    programName?: string;
    institutionName?: string;
    country?: string;
    deadline?: Date;
    priority?: string;
    officialUrl?: string;
  }): Promise<ApplicationWorkspace> {
    const workspace = await prisma.applicationWorkspace.create({
      data: {
        userId,
        entityType: data.entityType,
        entityId: data.entityId || null,
        title: data.title,
        programName: data.programName || null,
        institutionName: data.institutionName || null,
        country: data.country || null,
        deadline: data.deadline || null,
        priority: data.priority || 'medium',
        officialUrl: data.officialUrl || null,
      },
    });

    return this.formatWorkspace(workspace, []);
  }

  async getWorkspaces(userId: string, options?: { status?: string; entityType?: string; page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (options?.status) where.status = options.status;
    if (options?.entityType) where.entityType = options.entityType;

    const [workspaces, total] = await Promise.all([
      prisma.applicationWorkspace.findMany({
        where,
        include: { checklistItems: { orderBy: { order: 'asc' } } },
        orderBy: [{ priority: 'desc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.applicationWorkspace.count({ where }),
    ]);

    return {
      data: workspaces.map(w => this.formatWorkspace(w, w.checklistItems)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getWorkspaceById(workspaceId: string, userId: string): Promise<ApplicationWorkspace | null> {
    const workspace = await prisma.applicationWorkspace.findFirst({
      where: { id: workspaceId, userId },
      include: { checklistItems: { orderBy: { order: 'asc' } } },
    });
    if (!workspace) return null;
    return this.formatWorkspace(workspace, workspace.checklistItems);
  }

  async updateWorkspace(workspaceId: string, userId: string, data: {
    title?: string;
    programName?: string;
    institutionName?: string;
    country?: string;
    deadline?: Date;
    status?: ApplicationStatus;
    priority?: ApplicationPriority;
    notes?: string;
    officialUrl?: string;
  }): Promise<ApplicationWorkspace> {
    const workspace = await prisma.applicationWorkspace.findFirst({
      where: { id: workspaceId, userId },
    });
    if (!workspace) throw new Error('Workspace not found');

    const updated = await prisma.applicationWorkspace.update({
      where: { id: workspaceId },
      data,
      include: { checklistItems: { orderBy: { order: 'asc' } } },
    });

    return this.formatWorkspace(updated, updated.checklistItems);
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<boolean> {
    const workspace = await prisma.applicationWorkspace.findFirst({
      where: { id: workspaceId, userId },
    });
    if (!workspace) return false;

    await prisma.applicationWorkspace.delete({ where: { id: workspaceId } });
    return true;
  }

  async addChecklistItem(workspaceId: string, userId: string, data: {
    label: string;
    dueDate?: Date;
    category?: string;
    notes?: string;
  }): Promise<ApplicationChecklistItem> {
    const workspace = await prisma.applicationWorkspace.findFirst({
      where: { id: workspaceId, userId },
    });
    if (!workspace) throw new Error('Workspace not found');

    const maxOrder = await prisma.applicationChecklistItem.findFirst({
      where: { workspaceId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const item = await prisma.applicationChecklistItem.create({
      data: {
        workspaceId,
        label: data.label,
        dueDate: data.dueDate || null,
        category: data.category || null,
        notes: data.notes || null,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    return {
      id: item.id,
      workspaceId: item.workspaceId,
      label: item.label,
      isCompleted: item.isCompleted,
      dueDate: item.dueDate ?? undefined,
      category: item.category ?? undefined,
      notes: item.notes ?? undefined,
      order: item.order,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async updateChecklistItem(itemId: string, userId: string, data: {
    isCompleted?: boolean;
    label?: string;
    dueDate?: Date;
    notes?: string;
  }): Promise<ApplicationChecklistItem> {
    const item = await prisma.applicationChecklistItem.findFirst({
      where: { id: itemId },
      include: { workspace: true },
    });
    if (!item || item.workspace.userId !== userId) throw new Error('Item not found');

    const updated = await prisma.applicationChecklistItem.update({
      where: { id: itemId },
      data,
    });

    return {
      id: updated.id,
      workspaceId: updated.workspaceId,
      label: updated.label,
      isCompleted: updated.isCompleted,
      dueDate: updated.dueDate ?? undefined,
      category: updated.category ?? undefined,
      notes: updated.notes ?? undefined,
      order: updated.order,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteChecklistItem(itemId: string, userId: string): Promise<boolean> {
    const item = await prisma.applicationChecklistItem.findFirst({
      where: { id: itemId },
      include: { workspace: true },
    });
    if (!item || item.workspace.userId !== userId) return false;

    await prisma.applicationChecklistItem.delete({ where: { id: itemId } });
    return true;
  }

  async reorderChecklistItems(workspaceId: string, userId: string, itemOrders: { id: string; order: number }[]): Promise<boolean> {
    const workspace = await prisma.applicationWorkspace.findFirst({
      where: { id: workspaceId, userId },
    });
    if (!workspace) return false;

    await Promise.all(
      itemOrders.map(({ id, order }) =>
        prisma.applicationChecklistItem.update({
          where: { id },
          data: { order },
        })
      )
    );
    return true;
  }

  async getWorkspaceSummary(userId: string): Promise<WorkspaceSummary> {
    const workspaces = await prisma.applicationWorkspace.findMany({
      where: { userId },
      include: { checklistItems: true },
    });

    const byStatus: Record<string, number> = {};
    const allStatuses: ApplicationStatus[] = ['researching', 'preparing', 'documents_ready', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'deferred', 'withdrawn'];
    allStatuses.forEach(s => { byStatus[s] = 0; });
    workspaces.forEach(w => { byStatus[w.status] = (byStatus[w.status] || 0) + 1; });

    const now = new Date();
    const upcomingDeadlines = workspaces
      .filter(w => w.deadline && new Date(w.deadline) > now)
      .map(w => ({
        id: w.id,
        title: w.title,
        deadline: new Date(w.deadline!),
        daysLeft: Math.ceil((new Date(w.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    const totalChecklist = workspaces.reduce((sum, w) => sum + w.checklistItems.length, 0);
    const completedChecklist = workspaces.reduce((sum, w) => sum + w.checklistItems.filter(i => i.isCompleted).length, 0);
    const overallProgress = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

    return {
      total: workspaces.length,
      byStatus: byStatus as Record<ApplicationStatus, number>,
      upcomingDeadlines,
      overallProgress,
    };
  }

  async getDefaultChecklist(entityType: string, _title: string): Promise<{ label: string; category: string }[]> {
    if (entityType === 'university') {
      return [
        { label: 'Research university and program', category: 'research' },
        { label: 'Check admission requirements', category: 'research' },
        { label: 'Prepare academic transcripts', category: 'documents' },
        { label: 'Take language proficiency test (IELTS/TOEFL)', category: 'documents' },
        { label: 'Write Statement of Purpose', category: 'documents' },
        { label: 'Request recommendation letters', category: 'documents' },
        { label: 'Prepare CV/Resume', category: 'documents' },
        { label: 'Gather financial documents', category: 'documents' },
        { label: 'Submit application', category: 'submission' },
        { label: 'Apply for scholarship (if applicable)', category: 'financial' },
        { label: 'Apply for student visa', category: 'visa' },
        { label: 'Arrange health insurance', category: 'logistics' },
        { label: 'Book accommodation', category: 'logistics' },
      ];
    }
    if (entityType === 'scholarship') {
      return [
        { label: 'Check eligibility criteria', category: 'research' },
        { label: 'Prepare academic transcripts', category: 'documents' },
        { label: 'Write personal statement/essay', category: 'documents' },
        { label: 'Request recommendation letters', category: 'documents' },
        { label: 'Prepare financial documents', category: 'documents' },
        { label: 'Complete application form', category: 'submission' },
        { label: 'Submit before deadline', category: 'submission' },
      ];
    }
    return [
      { label: 'Research program requirements', category: 'research' },
      { label: 'Prepare application documents', category: 'documents' },
      { label: 'Submit application', category: 'submission' },
    ];
  }

  private formatWorkspace(workspace: Record<string, unknown>, checklistItems: Record<string, unknown>[]): ApplicationWorkspace {
    const w = workspace as { documentsJson?: string; requirementsJson?: string };
    return {
      id: String(workspace.id),
      userId: String(workspace.userId),
      entityType: String(workspace.entityType) as ApplicationWorkspace['entityType'],
      entityId: workspace.entityId ? String(workspace.entityId) : undefined,
      title: String(workspace.title),
      programName: workspace.programName ? String(workspace.programName) : undefined,
      institutionName: workspace.institutionName ? String(workspace.institutionName) : undefined,
      country: workspace.country ? String(workspace.country) : undefined,
      deadline: workspace.deadline ? new Date(workspace.deadline as Date | string) : undefined,
      status: String(workspace.status) as ApplicationWorkspace['status'],
      priority: String(workspace.priority) as ApplicationWorkspace['priority'],
      notes: workspace.notes ? String(workspace.notes) : undefined,
      officialUrl: workspace.officialUrl ? String(workspace.officialUrl) : undefined,
      documents: w.documentsJson ? JSON.parse(w.documentsJson) : [],
      requirements: w.requirementsJson ? JSON.parse(w.requirementsJson) : [],
      checklistItems: checklistItems.map(item => ({
        id: String(item.id),
        workspaceId: String(item.workspaceId),
        label: String(item.label),
        isCompleted: Boolean(item.isCompleted),
        dueDate: item.dueDate ? new Date(item.dueDate as Date | string) : undefined,
        category: item.category ? String(item.category) : undefined,
        notes: item.notes ? String(item.notes) : undefined,
        order: Number(item.order),
        createdAt: new Date(item.createdAt as Date | string),
        updatedAt: new Date(item.updatedAt as Date | string),
      })),
      createdAt: new Date(workspace.createdAt as Date | string),
      updatedAt: new Date(workspace.updatedAt as Date | string),
    };
  }
}

export const workspaceService = new WorkspaceService();
