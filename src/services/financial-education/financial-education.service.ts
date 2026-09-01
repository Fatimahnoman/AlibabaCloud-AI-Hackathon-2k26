import prisma from '@/lib/prisma';

export type CostVerificationStatus = 'verified' | 'estimated' | 'user_entered';
export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface CreateCostPlanInput {
  title: string;
  countryId?: string;
  targetCountry?: string;
  targetUniversity?: string;
  studyLevel?: string;
  studyField?: string;
  startDate?: Date;
  status?: PlanStatus;
  notes?: string;
  currency?: string;
}

export interface UpdateCostPlanInput {
  title?: string;
  countryId?: string;
  targetCountry?: string;
  targetUniversity?: string;
  studyLevel?: string;
  studyField?: string;
  startDate?: Date;
  status?: PlanStatus;
  notes?: string;
  currency?: string;
}

export interface AddCostItemInput {
  category: string;
  label: string;
  description?: string;
  amount: number;
  currency?: string;
  verificationStatus?: CostVerificationStatus;
  sourceType?: string;
  sourceUrl?: string;
  isRequired?: boolean;
  quantity?: number;
  notes?: string;
}

export interface UpdateCostItemInput {
  category?: string;
  label?: string;
  description?: string;
  amount?: number;
  currency?: string;
  verificationStatus?: CostVerificationStatus;
  sourceType?: string;
  sourceUrl?: string;
  isRequired?: boolean;
  quantity?: number;
  notes?: string;
}

export interface VerificationStatusBreakdown {
  total: number;
  count: number;
}

export interface CategoryBreakdownEntry {
  category: string;
  total: number;
  count: number;
}

export interface CostSummary {
  planId: string;
  title: string;
  currency: string;
  totalItems: number;
  grandTotal: number;
  byVerificationStatus: Record<string, VerificationStatusBreakdown>;
  byCategory: CategoryBreakdownEntry[];
}

export interface CostPlanComparison {
  planId: string;
  title: string;
  targetCountry: string | null;
  targetUniversity: string | null;
  studyLevel: string | null;
  status: string;
  currency: string;
  itemCount: number;
  verifiedTotal: number;
  estimatedTotal: number;
  grandTotal: number;
}

interface EstimatedCostTemplate {
  category: string;
  label: string;
  description: string;
  amount: number;
  quantity: number;
  isRequired: boolean;
}

const ESTIMATED_COST_TEMPLATES: EstimatedCostTemplate[] = [
  {
    category: 'application',
    label: 'University application fees',
    description: 'Estimated fees for applying to universities',
    amount: 150,
    quantity: 3,
    isRequired: true,
  },
  {
    category: 'testing',
    label: 'English proficiency tests',
    description: 'IELTS/TOEFL registration and preparation costs',
    amount: 250,
    quantity: 1,
    isRequired: true,
  },
  {
    category: 'visa',
    label: 'Visa application fee',
    description: 'Student visa application and related costs',
    amount: 350,
    quantity: 1,
    isRequired: true,
  },
  {
    category: 'travel',
    label: 'Flight tickets',
    description: 'One-way flight to study destination',
    amount: 1200,
    quantity: 1,
    isRequired: true,
  },
  {
    category: 'emergency',
    label: 'Emergency fund buffer',
    description: 'Recommended emergency reserve for unexpected costs',
    amount: 1000,
    quantity: 1,
    isRequired: false,
  },
];

function toAmount(value: unknown): number {
  return Number(value);
}

function toPlan(row: any) {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    countryId: row.countryId ?? null,
    targetCountry: row.targetCountry ?? null,
    targetUniversity: row.targetUniversity ?? null,
    studyLevel: row.studyLevel ?? null,
    studyField: row.studyField ?? null,
    startDate: row.startDate ?? null,
    status: row.status,
    notes: row.notes ?? null,
    currency: row.currency,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(Array.isArray(row.items) ? { items: row.items.map(toItem) } : {}),
  };
}

function toItem(row: any) {
  return {
    id: row.id,
    planId: row.planId,
    category: row.category,
    label: row.label,
    description: row.description ?? null,
    amount: toAmount(row.amount),
    currency: row.currency,
    verificationStatus: row.verificationStatus,
    sourceType: row.sourceType ?? null,
    sourceUrl: row.sourceUrl ?? null,
    isRequired: row.isRequired,
    quantity: row.quantity,
    notes: row.notes ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function itemLineTotal(row: any): number {
  return toAmount(row.amount) * row.quantity;
}

export class FinancialEducationService {
  async createPlan(userId: string, input: CreateCostPlanInput) {
    const row = await prisma.educationCostPlan.create({
      data: {
        userId,
        title: input.title,
        countryId: input.countryId,
        targetCountry: input.targetCountry,
        targetUniversity: input.targetUniversity,
        studyLevel: input.studyLevel,
        studyField: input.studyField,
        startDate: input.startDate,
        status: input.status ?? 'draft',
        notes: input.notes,
        currency: input.currency ?? 'USD',
      },
    });
    return toPlan(row);
  }

  async getPlans(userId: string, filters?: { status?: string }) {
    const where: any = { userId };
    if (filters?.status) where.status = filters.status;
    const rows = await prisma.educationCostPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toPlan);
  }

  async getPlanById(planId: string, userId: string) {
    const row = await prisma.educationCostPlan.findFirst({
      where: { id: planId, userId },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
    return row ? toPlan(row) : null;
  }

  async updatePlan(planId: string, userId: string, input: UpdateCostPlanInput) {
    const existing = await prisma.educationCostPlan.findFirst({ where: { id: planId, userId } });
    if (!existing) return null;
    const updated = await prisma.educationCostPlan.update({
      where: { id: planId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.countryId !== undefined && { countryId: input.countryId }),
        ...(input.targetCountry !== undefined && { targetCountry: input.targetCountry }),
        ...(input.targetUniversity !== undefined && { targetUniversity: input.targetUniversity }),
        ...(input.studyLevel !== undefined && { studyLevel: input.studyLevel }),
        ...(input.studyField !== undefined && { studyField: input.studyField }),
        ...(input.startDate !== undefined && { startDate: input.startDate }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.currency !== undefined && { currency: input.currency }),
      },
    });
    return toPlan(updated);
  }

  async deletePlan(planId: string, userId: string): Promise<boolean> {
    const existing = await prisma.educationCostPlan.findFirst({ where: { id: planId, userId } });
    if (!existing) return false;
    await prisma.educationCostItem.deleteMany({ where: { planId } });
    await prisma.educationCostPlan.delete({ where: { id: planId } });
    return true;
  }

  async addItem(planId: string, userId: string, input: AddCostItemInput) {
    const plan = await prisma.educationCostPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new Error('Education cost plan not found');
    const row = await prisma.educationCostItem.create({
      data: {
        planId,
        category: input.category,
        label: input.label,
        description: input.description,
        amount: input.amount,
        currency: input.currency ?? plan.currency,
        verificationStatus: input.verificationStatus ?? 'user_entered',
        sourceType: input.sourceType,
        sourceUrl: input.sourceUrl,
        isRequired: input.isRequired ?? true,
        quantity: input.quantity ?? 1,
        notes: input.notes,
      },
    });
    return toItem(row);
  }

  async updateItem(itemId: string, userId: string, input: UpdateCostItemInput) {
    const existing = await prisma.educationCostItem.findFirst({
      where: { id: itemId, plan: { userId } },
    });
    if (!existing) return null;
    const updated = await prisma.educationCostItem.update({
      where: { id: itemId },
      data: {
        ...(input.category !== undefined && { category: input.category }),
        ...(input.label !== undefined && { label: input.label }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.verificationStatus !== undefined && { verificationStatus: input.verificationStatus }),
        ...(input.sourceType !== undefined && { sourceType: input.sourceType }),
        ...(input.sourceUrl !== undefined && { sourceUrl: input.sourceUrl }),
        ...(input.isRequired !== undefined && { isRequired: input.isRequired }),
        ...(input.quantity !== undefined && { quantity: input.quantity }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
    return toItem(updated);
  }

  async deleteItem(itemId: string, userId: string): Promise<boolean> {
    const existing = await prisma.educationCostItem.findFirst({
      where: { id: itemId, plan: { userId } },
    });
    if (!existing) return false;
    await prisma.educationCostItem.delete({ where: { id: itemId } });
    return true;
  }

  async getItems(planId: string, filters?: { category?: string }) {
    const where: any = { planId };
    if (filters?.category) where.category = filters.category;
    const rows = await prisma.educationCostItem.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toItem);
  }

  async getCostSummary(planId: string, userId: string): Promise<CostSummary | null> {
    const plan = await prisma.educationCostPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) return null;

    const rows = await prisma.educationCostItem.findMany({
      where: { planId },
      orderBy: { createdAt: 'asc' },
    });

    let grandTotal = 0;
    const byVerificationStatus: Record<string, VerificationStatusBreakdown> = {};
    const categoryTotals: Record<string, { total: number; count: number }> = {};

    for (const row of rows) {
      const lineTotal = itemLineTotal(row);
      grandTotal += lineTotal;

      const statusKey = row.verificationStatus;
      if (!byVerificationStatus[statusKey]) {
        byVerificationStatus[statusKey] = { total: 0, count: 0 };
      }
      byVerificationStatus[statusKey].total += lineTotal;
      byVerificationStatus[statusKey].count += 1;

      if (!categoryTotals[row.category]) {
        categoryTotals[row.category] = { total: 0, count: 0 };
      }
      categoryTotals[row.category].total += lineTotal;
      categoryTotals[row.category].count += 1;
    }

    const byCategory: CategoryBreakdownEntry[] = Object.entries(categoryTotals)
      .map(([category, entry]) => ({ category, total: entry.total, count: entry.count }))
      .sort((a, b) => b.total - a.total);

    return {
      planId,
      title: plan.title,
      currency: plan.currency,
      totalItems: rows.length,
      grandTotal,
      byVerificationStatus,
      byCategory,
    };
  }

  async autoPopulateFromCountry(planId: string, countryId?: string): Promise<number> {
    const plan = await prisma.educationCostPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error('Education cost plan not found');

    const effectiveCountryId = countryId ?? plan.countryId;
    if (!effectiveCountryId) throw new Error('No country associated with this plan');

    const costRecords = await prisma.countryCostInfo.findMany({
      where: { countryId: effectiveCountryId },
      orderBy: [{ category: 'asc' }, { subcategory: 'asc' }],
    });

    let created = 0;

    for (const record of costRecords) {
      await prisma.educationCostItem.create({
        data: {
          planId,
          category: record.category,
          label: record.subcategory ?? record.category,
          description: record.period
            ? `Average ${record.period} cost from ${record.sourceName ?? 'official sources'}`
            : `Average cost from ${record.sourceName ?? 'official sources'}`,
          amount: toAmount(record.averageCost),
          currency: record.currency,
          verificationStatus: record.isVerified ? 'verified' : 'estimated',
          sourceType: 'country_data',
          sourceUrl: record.sourceUrl,
          isRequired: true,
          quantity: record.period === 'monthly' ? 12 : 1,
        },
      });
      created++;
    }

    for (const template of ESTIMATED_COST_TEMPLATES) {
      await prisma.educationCostItem.create({
        data: {
          planId,
          category: template.category,
          label: template.label,
          description: template.description,
          amount: template.amount,
          currency: plan.currency,
          verificationStatus: 'estimated',
          sourceType: 'estimate',
          isRequired: template.isRequired,
          quantity: template.quantity,
        },
      });
      created++;
    }

    await prisma.educationCostPlan.update({
      where: { id: planId },
      data: { countryId: effectiveCountryId },
    });

    return created;
  }

  async getCostComparison(userId: string): Promise<CostPlanComparison[]> {
    const plans = await prisma.educationCostPlan.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const comparisons = plans.map((plan) => {
      let verifiedTotal = 0;
      let estimatedTotal = 0;

      for (const item of plan.items) {
        const lineTotal = itemLineTotal(item);
        if (item.verificationStatus === 'verified') {
          verifiedTotal += lineTotal;
        } else {
          estimatedTotal += lineTotal;
        }
      }

      return {
        planId: plan.id,
        title: plan.title,
        targetCountry: plan.targetCountry ?? null,
        targetUniversity: plan.targetUniversity ?? null,
        studyLevel: plan.studyLevel ?? null,
        status: plan.status,
        currency: plan.currency,
        itemCount: plan.items.length,
        verifiedTotal,
        estimatedTotal,
        grandTotal: verifiedTotal + estimatedTotal,
      };
    });

    return comparisons.sort((a, b) => b.grandTotal - a.grandTotal);
  }
}

export const financialEducationService = new FinancialEducationService();
