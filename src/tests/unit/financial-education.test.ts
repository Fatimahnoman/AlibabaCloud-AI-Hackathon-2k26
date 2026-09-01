import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  educationCostPlan: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  educationCostItem: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
  countryCostInfo: { findMany: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({ default: mockPrisma }));

import { FinancialEducationService } from '@/services/financial-education/financial-education.service';

const mockedPrisma = vi.mocked(mockPrisma);

const service = new FinancialEducationService();
const TEST_USER = 'user-1';

const mockPlanRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'plan-1',
  userId: TEST_USER,
  title: 'MS in Computer Science',
  countryId: 'country-de',
  targetCountry: 'Germany',
  targetUniversity: 'TU Munich',
  studyLevel: 'masters',
  studyField: 'computer-science',
  startDate: new Date('2026-10-01T00:00:00'),
  status: 'draft',
  notes: null,
  currency: 'EUR',
  createdAt: new Date('2026-06-01T08:00:00'),
  updatedAt: new Date('2026-06-01T08:00:00'),
  ...overrides,
});

const mockItemRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'item-1',
  planId: 'plan-1',
  category: 'tuition',
  label: 'Semester tuition fee',
  description: null,
  amount: 5000,
  currency: 'EUR',
  verificationStatus: 'user_entered',
  sourceType: null,
  sourceUrl: null,
  isRequired: true,
  quantity: 1,
  notes: null,
  createdAt: new Date('2026-06-02T08:00:00'),
  updatedAt: new Date('2026-06-02T08:00:00'),
  ...overrides,
});

const mockCostInfoRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'cost-1',
  countryId: 'country-de',
  category: 'tuition',
  subcategory: 'Public university semester fee',
  averageCost: 350,
  currency: 'EUR',
  period: 'yearly',
  sourceName: 'DAAD',
  sourceUrl: 'https://www.daad.de/costs',
  isVerified: true,
  lastVerifiedAt: new Date('2026-05-01T09:00:00'),
  year: 2026,
  createdAt: new Date('2026-01-01T08:00:00'),
  ...overrides,
});

describe('FinancialEducationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPlan', () => {
    it('creates plan with defaults', async () => {
      mockedPrisma.educationCostPlan.create.mockResolvedValue(mockPlanRow() as never);

      const result = await service.createPlan(TEST_USER, {
        title: 'MS in Computer Science',
        targetCountry: 'Germany',
        targetUniversity: 'TU Munich',
        studyLevel: 'masters',
        studyField: 'computer-science',
        startDate: new Date('2026-10-01T00:00:00'),
      });

      expect(result.id).toBe('plan-1');
      expect(result.userId).toBe(TEST_USER);
      expect(result.title).toBe('MS in Computer Science');
      expect(result.status).toBe('draft');
      expect(result.currency).toBe('EUR');
      expect(mockedPrisma.educationCostPlan.create).toHaveBeenCalledWith({
        data: {
          userId: TEST_USER,
          title: 'MS in Computer Science',
          targetCountry: 'Germany',
          targetUniversity: 'TU Munich',
          studyLevel: 'masters',
          studyField: 'computer-science',
          startDate: new Date('2026-10-01T00:00:00'),
          status: 'draft',
          currency: 'USD',
        },
      });
    });
  });

  describe('getPlans', () => {
    it('returns plans for user', async () => {
      mockedPrisma.educationCostPlan.findMany.mockResolvedValue([
        mockPlanRow(),
        mockPlanRow({ id: 'plan-2', title: 'BSc in Canada', targetCountry: 'Canada', currency: 'CAD' }),
      ] as never);

      const result = await service.getPlans(TEST_USER);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('plan-1');
      expect(result[0].userId).toBe(TEST_USER);
      expect(result[1].title).toBe('BSc in Canada');
      expect(result[1].currency).toBe('CAD');
      expect(mockedPrisma.educationCostPlan.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('filters by status when provided', async () => {
      mockedPrisma.educationCostPlan.findMany.mockResolvedValue([]);

      const result = await service.getPlans(TEST_USER, { status: 'active' });

      expect(result).toEqual([]);
      expect(mockedPrisma.educationCostPlan.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER, status: 'active' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getPlanById', () => {
    it('returns plan with items', async () => {
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(
        mockPlanRow({
          items: [
            mockItemRow(),
            mockItemRow({
              id: 'item-2',
              category: 'living',
              label: 'Student dormitory rent',
              amount: 450,
              quantity: 12,
              verificationStatus: 'estimated',
              createdAt: new Date('2026-06-03T08:00:00'),
            }),
          ],
        }) as never
      );

      const result = await service.getPlanById('plan-1', TEST_USER);

      expect(result).not.toBeNull();
      expect(result!.id).toBe('plan-1');
      expect(result!.items).toHaveLength(2);
      expect(result!.items![0].label).toBe('Semester tuition fee');
      expect(result!.items![0].amount).toBe(5000);
      expect(result!.items![1].quantity).toBe(12);
      expect(mockedPrisma.educationCostPlan.findFirst).toHaveBeenCalledWith({
        where: { id: 'plan-1', userId: TEST_USER },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      });
    });

    it('returns null when not found', async () => {
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(null);

      const result = await service.getPlanById('plan-404', TEST_USER);

      expect(result).toBeNull();
    });
  });

  describe('updatePlan', () => {
    it('updates fields', async () => {
      const startDate = new Date('2027-04-01T00:00:00');
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(mockPlanRow() as never);
      mockedPrisma.educationCostPlan.update.mockResolvedValue(
        mockPlanRow({
          title: 'MSc Applied CS',
          targetUniversity: 'LMU Munich',
          status: 'active',
          currency: 'USD',
          startDate,
        }) as never
      );

      const result = await service.updatePlan('plan-1', TEST_USER, {
        title: 'MSc Applied CS',
        targetUniversity: 'LMU Munich',
        status: 'active',
        currency: 'USD',
        startDate,
      });

      expect(result).not.toBeNull();
      expect(result!.title).toBe('MSc Applied CS');
      expect(result!.status).toBe('active');
      expect(result!.currency).toBe('USD');
      expect(mockedPrisma.educationCostPlan.update).toHaveBeenCalledWith({
        where: { id: 'plan-1' },
        data: {
          title: 'MSc Applied CS',
          targetUniversity: 'LMU Munich',
          status: 'active',
          currency: 'USD',
          startDate,
        },
      });
    });

    it('returns null when not found', async () => {
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(null);

      const result = await service.updatePlan('plan-404', TEST_USER, { title: 'Nope' });

      expect(result).toBeNull();
      expect(mockedPrisma.educationCostPlan.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePlan', () => {
    it('deletes plan and items', async () => {
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(mockPlanRow() as never);
      mockedPrisma.educationCostItem.deleteMany.mockResolvedValue({ count: 4 } as never);
      mockedPrisma.educationCostPlan.delete.mockResolvedValue(mockPlanRow() as never);

      const result = await service.deletePlan('plan-1', TEST_USER);

      expect(result).toBe(true);
      expect(mockedPrisma.educationCostItem.deleteMany).toHaveBeenCalledWith({
        where: { planId: 'plan-1' },
      });
      expect(mockedPrisma.educationCostPlan.delete).toHaveBeenCalledWith({
        where: { id: 'plan-1' },
      });
      expect(mockedPrisma.educationCostItem.deleteMany.mock.invocationCallOrder[0]).toBeLessThan(
        mockedPrisma.educationCostPlan.delete.mock.invocationCallOrder[0]
      );
    });

    it('returns false when not found', async () => {
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(null);

      const result = await service.deletePlan('plan-404', TEST_USER);

      expect(result).toBe(false);
      expect(mockedPrisma.educationCostItem.deleteMany).not.toHaveBeenCalled();
      expect(mockedPrisma.educationCostPlan.delete).not.toHaveBeenCalled();
    });
  });

  describe('addItem', () => {
    it('creates item with correct fields', async () => {
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(mockPlanRow() as never);
      mockedPrisma.educationCostItem.create.mockResolvedValue(
        mockItemRow({
          id: 'item-new',
          amount: 350,
          quantity: 2,
          verificationStatus: 'verified',
          sourceType: 'country_data',
          sourceUrl: 'https://www.daad.de/costs',
          description: 'Public university semester contribution',
          notes: 'Per academic year',
        }) as never
      );

      const result = await service.addItem('plan-1', TEST_USER, {
        category: 'tuition',
        label: 'Semester tuition fee',
        description: 'Public university semester contribution',
        amount: 350,
        currency: 'EUR',
        verificationStatus: 'verified',
        sourceType: 'country_data',
        sourceUrl: 'https://www.daad.de/costs',
        isRequired: true,
        quantity: 2,
        notes: 'Per academic year',
      });

      expect(result.id).toBe('item-new');
      expect(result.planId).toBe('plan-1');
      expect(result.amount).toBe(350);
      expect(result.quantity).toBe(2);
      expect(result.verificationStatus).toBe('verified');
      expect(mockedPrisma.educationCostPlan.findFirst).toHaveBeenCalledWith({
        where: { id: 'plan-1', userId: TEST_USER },
      });
      expect(mockedPrisma.educationCostItem.create).toHaveBeenCalledWith({
        data: {
          planId: 'plan-1',
          category: 'tuition',
          label: 'Semester tuition fee',
          description: 'Public university semester contribution',
          amount: 350,
          currency: 'EUR',
          verificationStatus: 'verified',
          sourceType: 'country_data',
          sourceUrl: 'https://www.daad.de/costs',
          isRequired: true,
          quantity: 2,
          notes: 'Per academic year',
        },
      });
    });

    it('defaults quantity to 1', async () => {
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(mockPlanRow() as never);
      mockedPrisma.educationCostItem.create.mockResolvedValue(
        mockItemRow({
          id: 'item-books',
          category: 'materials',
          label: 'Textbooks',
          amount: 300,
        }) as never
      );

      const result = await service.addItem('plan-1', TEST_USER, {
        category: 'materials',
        label: 'Textbooks',
        amount: 300,
      });

      expect(result.quantity).toBe(1);
      expect(mockedPrisma.educationCostItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          planId: 'plan-1',
          category: 'materials',
          label: 'Textbooks',
          amount: 300,
          quantity: 1,
          currency: 'EUR',
          verificationStatus: 'user_entered',
          isRequired: true,
        }),
      });
    });
  });

  describe('updateItem', () => {
    it('updates item', async () => {
      mockedPrisma.educationCostItem.findFirst.mockResolvedValue(mockItemRow() as never);
      mockedPrisma.educationCostItem.update.mockResolvedValue(
        mockItemRow({
          label: 'Semester fee (updated)',
          amount: 400,
          quantity: 2,
          isRequired: false,
        }) as never
      );

      const result = await service.updateItem('item-1', TEST_USER, {
        label: 'Semester fee (updated)',
        amount: 400,
        quantity: 2,
        isRequired: false,
      });

      expect(result).not.toBeNull();
      expect(result!.label).toBe('Semester fee (updated)');
      expect(result!.amount).toBe(400);
      expect(result!.isRequired).toBe(false);
      expect(mockedPrisma.educationCostItem.findFirst).toHaveBeenCalledWith({
        where: { id: 'item-1', plan: { userId: TEST_USER } },
      });
      expect(mockedPrisma.educationCostItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: {
          label: 'Semester fee (updated)',
          amount: 400,
          quantity: 2,
          isRequired: false,
        },
      });
    });

    it('returns null when not found', async () => {
      mockedPrisma.educationCostItem.findFirst.mockResolvedValue(null);

      const result = await service.updateItem('item-404', TEST_USER, { label: 'Nope' });

      expect(result).toBeNull();
      expect(mockedPrisma.educationCostItem.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteItem', () => {
    it('deletes item', async () => {
      mockedPrisma.educationCostItem.findFirst.mockResolvedValue(mockItemRow() as never);
      mockedPrisma.educationCostItem.delete.mockResolvedValue(mockItemRow() as never);

      const result = await service.deleteItem('item-1', TEST_USER);

      expect(result).toBe(true);
      expect(mockedPrisma.educationCostItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });

    it('returns false when not found', async () => {
      mockedPrisma.educationCostItem.findFirst.mockResolvedValue(null);

      const result = await service.deleteItem('item-404', TEST_USER);

      expect(result).toBe(false);
      expect(mockedPrisma.educationCostItem.delete).not.toHaveBeenCalled();
    });
  });

  describe('getItems', () => {
    it('returns items for plan', async () => {
      mockedPrisma.educationCostItem.findMany.mockResolvedValue([
        mockItemRow(),
        mockItemRow({
          id: 'item-2',
          category: 'living',
          label: 'Health insurance',
          amount: 110,
          createdAt: new Date('2026-06-03T08:00:00'),
        }),
      ] as never);

      const result = await service.getItems('plan-1');

      expect(result).toHaveLength(2);
      expect(result[0].label).toBe('Semester tuition fee');
      expect(result[0].amount).toBe(5000);
      expect(result[1].amount).toBe(110);
      expect(mockedPrisma.educationCostItem.findMany).toHaveBeenCalledWith({
        where: { planId: 'plan-1' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('filters by category', async () => {
      mockedPrisma.educationCostItem.findMany.mockResolvedValue([]);

      const result = await service.getItems('plan-1', { category: 'tuition' });

      expect(result).toEqual([]);
      expect(mockedPrisma.educationCostItem.findMany).toHaveBeenCalledWith({
        where: { planId: 'plan-1', category: 'tuition' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getCostSummary', () => {
    const summaryItems = [
      mockItemRow({
        id: 'item-a',
        category: 'tuition',
        amount: 20000,
        verificationStatus: 'verified',
      }),
      mockItemRow({
        id: 'item-b',
        category: 'living',
        label: 'Rent',
        amount: 800,
        quantity: 12,
        verificationStatus: 'estimated',
        createdAt: new Date('2026-06-03T08:00:00'),
      }),
      mockItemRow({
        id: 'item-c',
        category: 'miscellaneous',
        label: 'Stationery',
        amount: 50,
        verificationStatus: 'user_entered',
        createdAt: new Date('2026-06-04T08:00:00'),
      }),
    ];

    it('calculates totals by verification status', async () => {
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(mockPlanRow() as never);
      mockedPrisma.educationCostItem.findMany.mockResolvedValue(summaryItems as never);

      const result = await service.getCostSummary('plan-1', TEST_USER);

      expect(result).not.toBeNull();
      expect(result!.planId).toBe('plan-1');
      expect(result!.currency).toBe('EUR');
      expect(result!.totalItems).toBe(3);
      expect(result!.grandTotal).toBe(29650);
      expect(result!.byVerificationStatus.verified).toEqual({ total: 20000, count: 1 });
      expect(result!.byVerificationStatus.estimated).toEqual({ total: 9600, count: 1 });
      expect(result!.byVerificationStatus.user_entered).toEqual({ total: 50, count: 1 });
      expect(mockedPrisma.educationCostPlan.findFirst).toHaveBeenCalledWith({
        where: { id: 'plan-1', userId: TEST_USER },
      });
      expect(mockedPrisma.educationCostItem.findMany).toHaveBeenCalledWith({
        where: { planId: 'plan-1' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('groups totals by category sorted descending', async () => {
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(mockPlanRow() as never);
      mockedPrisma.educationCostItem.findMany.mockResolvedValue([
        ...summaryItems,
        mockItemRow({
          id: 'item-d',
          category: 'tuition',
          label: 'Tuition second year',
          amount: 5000,
          verificationStatus: 'estimated',
          createdAt: new Date('2026-06-05T08:00:00'),
        }),
      ] as never);

      const result = await service.getCostSummary('plan-1', TEST_USER);

      expect(result!.byCategory).toEqual([
        { category: 'tuition', total: 25000, count: 2 },
        { category: 'living', total: 9600, count: 1 },
        { category: 'miscellaneous', total: 50, count: 1 },
      ]);
    });

    it('returns null when plan not found', async () => {
      mockedPrisma.educationCostPlan.findFirst.mockResolvedValue(null);

      const result = await service.getCostSummary('plan-404', TEST_USER);

      expect(result).toBeNull();
      expect(mockedPrisma.educationCostItem.findMany).not.toHaveBeenCalled();
    });
  });

  describe('autoPopulateFromCountry', () => {
    it('creates items from country cost data', async () => {
      mockedPrisma.educationCostPlan.findUnique.mockResolvedValue(mockPlanRow() as never);
      mockedPrisma.countryCostInfo.findMany.mockResolvedValue([
        mockCostInfoRow(),
        mockCostInfoRow({
          id: 'cost-2',
          category: 'living',
          subcategory: 'Student dormitory rent',
          averageCost: 450,
          period: 'monthly',
          isVerified: false,
          sourceUrl: null,
        }),
      ] as never);
      mockedPrisma.educationCostItem.create.mockResolvedValue(mockItemRow() as never);

      const result = await service.autoPopulateFromCountry('plan-1');

      expect(result).toBe(7);
      expect(mockedPrisma.countryCostInfo.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de' },
        orderBy: [{ category: 'asc' }, { subcategory: 'asc' }],
      });
      expect(mockedPrisma.educationCostItem.create).toHaveBeenCalledTimes(7);
      expect(mockedPrisma.educationCostItem.create).toHaveBeenNthCalledWith(1, {
        data: {
          planId: 'plan-1',
          category: 'tuition',
          label: 'Public university semester fee',
          description: 'Average yearly cost from DAAD',
          amount: 350,
          currency: 'EUR',
          verificationStatus: 'verified',
          sourceType: 'country_data',
          sourceUrl: 'https://www.daad.de/costs',
          isRequired: true,
          quantity: 1,
        },
      });
      expect(mockedPrisma.educationCostItem.create).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          planId: 'plan-1',
          category: 'living',
          label: 'Student dormitory rent',
          amount: 450,
          currency: 'EUR',
          verificationStatus: 'estimated',
          sourceType: 'country_data',
          quantity: 12,
        }),
      });
    });

    it('adds estimated application/testing/visa/travel/emergency items', async () => {
      mockedPrisma.educationCostPlan.findUnique.mockResolvedValue(mockPlanRow() as never);
      mockedPrisma.countryCostInfo.findMany.mockResolvedValue([mockCostInfoRow()] as never);
      mockedPrisma.educationCostItem.create.mockResolvedValue(mockItemRow() as never);

      const result = await service.autoPopulateFromCountry('plan-1');

      expect(result).toBe(6);
      expect(mockedPrisma.educationCostItem.create).toHaveBeenCalledTimes(6);
      const templateCalls = mockedPrisma.educationCostItem.create.mock.calls.slice(-5);
      expect(templateCalls.map((call) => call[0].data.category)).toEqual([
        'application',
        'testing',
        'visa',
        'travel',
        'emergency',
      ]);
      for (const call of templateCalls) {
        expect(call[0].data.verificationStatus).toBe('estimated');
        expect(call[0].data.sourceType).toBe('estimate');
        expect(call[0].data.currency).toBe('EUR');
      }
      expect(templateCalls[0][0].data.amount).toBe(150);
      expect(templateCalls[0][0].data.quantity).toBe(3);
      expect(templateCalls[1][0].data.amount).toBe(250);
      expect(templateCalls[2][0].data.amount).toBe(350);
      expect(templateCalls[3][0].data.amount).toBe(1200);
      expect(templateCalls[3][0].data.isRequired).toBe(true);
      expect(templateCalls[4][0].data.amount).toBe(1000);
      expect(templateCalls[4][0].data.isRequired).toBe(false);
    });
  });

  describe('getCostComparison', () => {
    it('returns comparison of user plans sorted by total', async () => {
      mockedPrisma.educationCostPlan.findMany.mockResolvedValue([
        mockPlanRow({
          id: 'plan-1',
          title: 'Study in Germany',
          status: 'active',
          items: [
            mockItemRow({
              id: 'item-a',
              category: 'tuition',
              amount: 20000,
              verificationStatus: 'verified',
            }),
            mockItemRow({
              id: 'item-b',
              category: 'living',
              label: 'Rent',
              amount: 800,
              quantity: 12,
              verificationStatus: 'estimated',
              createdAt: new Date('2026-06-03T08:00:00'),
            }),
          ],
        }),
        mockPlanRow({
          id: 'plan-2',
          title: 'Study in Canada',
          targetCountry: 'Canada',
          targetUniversity: 'UofT',
          studyLevel: 'bachelors',
          currency: 'CAD',
          items: [
            mockItemRow({
              id: 'item-c',
              planId: 'plan-2',
              category: 'tuition',
              amount: 15000,
              currency: 'CAD',
              verificationStatus: 'estimated',
            }),
          ],
        }),
      ] as never);

      const result = await service.getCostComparison(TEST_USER);

      expect(result).toHaveLength(2);
      expect(result[0].planId).toBe('plan-1');
      expect(result[0].title).toBe('Study in Germany');
      expect(result[0].targetCountry).toBe('Germany');
      expect(result[0].status).toBe('active');
      expect(result[0].itemCount).toBe(2);
      expect(result[0].verifiedTotal).toBe(20000);
      expect(result[0].estimatedTotal).toBe(9600);
      expect(result[0].grandTotal).toBe(29600);
      expect(result[1].planId).toBe('plan-2');
      expect(result[1].targetCountry).toBe('Canada');
      expect(result[1].currency).toBe('CAD');
      expect(result[1].itemCount).toBe(1);
      expect(result[1].verifiedTotal).toBe(0);
      expect(result[1].estimatedTotal).toBe(15000);
      expect(result[1].grandTotal).toBe(15000);
      expect(mockedPrisma.educationCostPlan.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
