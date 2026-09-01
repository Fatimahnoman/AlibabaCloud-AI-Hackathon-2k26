import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  countryProfile: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  countryEducationAuthority: { findMany: vi.fn() },
  countryVisaSource: { findMany: vi.fn() },
  countryReportingAuthority: { findMany: vi.fn() },
  countryCostInfo: { findMany: vi.fn() },
  countryScholarship: { findMany: vi.fn() },
  countryAdmissionRequirement: { findMany: vi.fn() },
  university: { groupBy: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({ default: mockPrisma }));

import { CountryIntelligenceService } from '@/services/country-intelligence/country-intelligence.service';

const mockedPrisma = vi.mocked(mockPrisma);

const service = new CountryIntelligenceService();
const CREATED_AT = new Date('2026-01-01T08:00:00');
const VERIFIED_AT = new Date('2026-02-01T09:00:00');

const mockCountryRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'country-de',
  name: 'Germany',
  code: 'DE',
  region: 'Europe',
  capital: 'Berlin',
  currency: 'EUR',
  language: 'German',
  educationSystem: 'Dual education system',
  timezone: 'Europe/Berlin',
  costOfLivingIndex: 65,
  qualityOfLifeIndex: 88,
  safetyIndex: 80,
  popularForStudents: true,
  profileImageUrl: null,
  overview: 'A top study destination',
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

const mockAuthorityRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'auth-1',
  countryId: 'country-de',
  name: 'German Academic Exchange Service',
  acronym: 'DAAD',
  type: 'funding_body',
  description: null,
  websiteUrl: 'https://www.daad.de',
  isVerified: true,
  lastVerifiedAt: VERIFIED_AT,
  createdAt: CREATED_AT,
  ...overrides,
});

const mockVisaSourceRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'visa-1',
  countryId: 'country-de',
  sourceName: 'Federal Foreign Office',
  sourceUrl: 'https://www.auswaertiges-amt.de',
  visaType: 'student_visa',
  description: null,
  processingTime: '6-12 weeks',
  requirements: 'Passport, admission letter, proof of funds',
  isVerified: true,
  lastVerifiedAt: VERIFIED_AT,
  createdAt: CREATED_AT,
  ...overrides,
});

const mockReportingBodyRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'rep-1',
  countryId: 'country-de',
  name: 'Central Office for Foreign Education',
  type: 'credential_evaluation',
  description: null,
  websiteUrl: 'https://www.anabin.de',
  contactEmail: 'info@anabin.de',
  contactPhone: null,
  isVerified: true,
  lastVerifiedAt: VERIFIED_AT,
  createdAt: CREATED_AT,
  ...overrides,
});

const mockCostRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'cost-1',
  countryId: 'country-de',
  category: 'tuition',
  subcategory: 'public_university',
  averageCost: 350,
  currency: 'EUR',
  period: 'per_semester',
  sourceName: 'DAAD database',
  sourceUrl: null,
  isVerified: true,
  lastVerifiedAt: VERIFIED_AT,
  year: 2026,
  createdAt: CREATED_AT,
  ...overrides,
});

const mockScholarshipRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'sch-1',
  countryId: 'country-de',
  name: 'DAAD Study Scholarship',
  provider: 'DAAD',
  type: 'merit_based',
  amount: 992,
  currency: 'EUR',
  coverage: 'monthly stipend',
  eligibility: 'International graduates',
  deadline: '2026-10-31',
  applicationUrl: 'https://www.daad.de/apply',
  description: null,
  isVerified: true,
  lastVerifiedAt: VERIFIED_AT,
  createdAt: CREATED_AT,
  ...overrides,
});

const mockAdmissionReqRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'req-1',
  countryId: 'country-de',
  level: 'bachelors',
  requirementType: 'language_proficiency',
  description: 'TestDaF or DSH certificate required',
  details: null,
  isVerified: true,
  lastVerifiedAt: VERIFIED_AT,
  createdAt: CREATED_AT,
  ...overrides,
});

describe('CountryIntelligenceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCountries', () => {
    it('returns all countries with summary data', async () => {
      mockedPrisma.university.groupBy.mockResolvedValue([
        { country: 'GERMANY', _count: { _all: 12 } },
      ] as never);
      mockedPrisma.countryProfile.findMany.mockResolvedValue([
        mockCountryRow({ _count: { scholarships: 8 } }),
      ] as never);

      const result = await service.getAllCountries();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'country-de',
        name: 'Germany',
        code: 'DE',
        region: 'Europe',
        currency: 'EUR',
        language: 'German',
        popularForStudents: true,
        costOfLivingIndex: 65,
        universityCount: 12,
        scholarshipCount: 8,
      });
      expect(mockedPrisma.countryProfile.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
        include: { _count: { select: { scholarships: true } } },
      });
      expect(mockedPrisma.university.groupBy).toHaveBeenCalledWith({
        by: ['country'],
        _count: { _all: true },
      });
    });

    it('defaults counts to zero when no data exists', async () => {
      mockedPrisma.university.groupBy.mockResolvedValue([] as never);
      mockedPrisma.countryProfile.findMany.mockResolvedValue([
        mockCountryRow(),
      ] as never);

      const result = await service.getAllCountries();

      expect(result[0].universityCount).toBe(0);
      expect(result[0].scholarshipCount).toBe(0);
    });

    it('filters by region', async () => {
      mockedPrisma.university.groupBy.mockResolvedValue([] as never);
      mockedPrisma.countryProfile.findMany.mockResolvedValue([
        mockCountryRow({
          id: 'country-ca',
          name: 'Canada',
          code: 'CA',
          region: 'North America',
          currency: 'CAD',
          language: 'English',
          costOfLivingIndex: 71,
          _count: { scholarships: 3 },
        }),
      ] as never);

      const result = await service.getAllCountries({ region: 'North America' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Canada');
      expect(result[0].universityCount).toBe(0);
      expect(mockedPrisma.countryProfile.findMany).toHaveBeenCalledWith({
        where: { region: 'North America' },
        orderBy: { name: 'asc' },
        include: { _count: { select: { scholarships: true } } },
      });
    });

    it('filters by popular flag', async () => {
      mockedPrisma.university.groupBy.mockResolvedValue([] as never);
      mockedPrisma.countryProfile.findMany.mockResolvedValue([] as never);

      await service.getAllCountries({ popular: true });

      expect(mockedPrisma.countryProfile.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { popularForStudents: true } })
      );

      await service.getAllCountries({ popular: false });

      expect(mockedPrisma.countryProfile.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { popularForStudents: false } })
      );
    });

    it('combines region and popular filters', async () => {
      mockedPrisma.university.groupBy.mockResolvedValue([] as never);
      mockedPrisma.countryProfile.findMany.mockResolvedValue([] as never);

      await service.getAllCountries({ region: 'Asia', popular: true });

      expect(mockedPrisma.countryProfile.findMany).toHaveBeenCalledWith({
        where: { region: 'Asia', popularForStudents: true },
        orderBy: { name: 'asc' },
        include: { _count: { select: { scholarships: true } } },
      });
    });

    it('returns empty array when no countries exist', async () => {
      mockedPrisma.university.groupBy.mockResolvedValue([] as never);
      mockedPrisma.countryProfile.findMany.mockResolvedValue([] as never);

      const result = await service.getAllCountries();

      expect(result).toEqual([]);
    });
  });

  describe('getCountryByCode', () => {
    it('returns full country detail with all relations', async () => {
      mockedPrisma.countryProfile.findUnique.mockResolvedValue({
        ...mockCountryRow(),
        authorities: [
          mockAuthorityRow(),
          mockAuthorityRow({
            id: 'auth-2',
            name: 'Standing Conference of Ministers of Education',
            acronym: null,
            type: 'accreditation_body',
            websiteUrl: null,
          }),
        ],
        visaSources: [mockVisaSourceRow()],
        reportingBodies: [mockReportingBodyRow()],
        costInfo: [
          mockCostRow(),
          mockCostRow({ id: 'cost-2', category: 'living', subcategory: null, averageCost: 11000, period: 'per_month' }),
        ],
        scholarships: [mockScholarshipRow()],
        admissionReqs: [
          mockAdmissionReqRow(),
          mockAdmissionReqRow({ id: 'req-2', level: 'masters', requirementType: 'academic', description: 'Recognized bachelor degree' }),
        ],
      } as never);

      const result = await service.getCountryByCode('DE');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('country-de');
      expect(result!.code).toBe('DE');
      expect(result!.capital).toBe('Berlin');
      expect(result!.currency).toBe('EUR');
      expect(result!.overview).toBe('A top study destination');
      expect(result!.profileImageUrl).toBeUndefined();
      expect(result!.authorities).toHaveLength(2);
      expect(result!.authorities[0]).toEqual({
        id: 'auth-1',
        countryId: 'country-de',
        name: 'German Academic Exchange Service',
        acronym: 'DAAD',
        type: 'funding_body',
        description: undefined,
        websiteUrl: 'https://www.daad.de',
        isVerified: true,
        lastVerifiedAt: VERIFIED_AT,
        createdAt: CREATED_AT,
      });
      expect(result!.authorities[1].acronym).toBeUndefined();
      expect(result!.visaSources).toHaveLength(1);
      expect(result!.visaSources[0].sourceName).toBe('Federal Foreign Office');
      expect(result!.visaSources[0].visaType).toBe('student_visa');
      expect(result!.reportingBodies).toHaveLength(1);
      expect(result!.reportingBodies[0].type).toBe('credential_evaluation');
      expect(result!.costInfo).toHaveLength(2);
      expect(result!.costInfo[0].averageCost).toBe(350);
      expect(result!.costInfo[1].subcategory).toBeUndefined();
      expect(result!.scholarships).toHaveLength(1);
      expect(result!.admissionReqs[1].level).toBe('masters');
      expect(mockedPrisma.countryProfile.findUnique).toHaveBeenCalledWith({
        where: { code: 'DE' },
        include: {
          authorities: true,
          visaSources: true,
          reportingBodies: true,
          costInfo: true,
          scholarships: true,
          admissionReqs: true,
        },
      });
    });

    it('returns null for unknown code', async () => {
      mockedPrisma.countryProfile.findUnique.mockResolvedValue(null);

      const result = await service.getCountryByCode('ZZ');

      expect(result).toBeNull();
      expect(mockedPrisma.countryProfile.findUnique).toHaveBeenCalledWith({
        where: { code: 'ZZ' },
        include: {
          authorities: true,
          visaSources: true,
          reportingBodies: true,
          costInfo: true,
          scholarships: true,
          admissionReqs: true,
        },
      });
    });
  });

  describe('getCountryAuthorities', () => {
    it('returns authorities for a country', async () => {
      mockedPrisma.countryEducationAuthority.findMany.mockResolvedValue([
        mockAuthorityRow(),
      ] as never);

      const result = await service.getCountryAuthorities('country-de');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'auth-1',
        countryId: 'country-de',
        name: 'German Academic Exchange Service',
        acronym: 'DAAD',
        type: 'funding_body',
        description: undefined,
        websiteUrl: 'https://www.daad.de',
        isVerified: true,
        lastVerifiedAt: VERIFIED_AT,
        createdAt: CREATED_AT,
      });
      expect(mockedPrisma.countryEducationAuthority.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('filters by authority type', async () => {
      mockedPrisma.countryEducationAuthority.findMany.mockResolvedValue([
        mockAuthorityRow({ id: 'auth-3', name: 'Accreditation Council', type: 'accreditation_body' }),
      ] as never);

      const result = await service.getCountryAuthorities('country-de', 'accreditation_body');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('accreditation_body');
      expect(mockedPrisma.countryEducationAuthority.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de', type: 'accreditation_body' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('returns empty array when no authorities exist', async () => {
      mockedPrisma.countryEducationAuthority.findMany.mockResolvedValue([] as never);

      const result = await service.getCountryAuthorities('country-xx');

      expect(result).toEqual([]);
    });
  });

  describe('getCountryVisaSources', () => {
    it('returns visa sources for a country', async () => {
      mockedPrisma.countryVisaSource.findMany.mockResolvedValue([
        mockVisaSourceRow(),
      ] as never);

      const result = await service.getCountryVisaSources('country-de');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'visa-1',
        countryId: 'country-de',
        sourceName: 'Federal Foreign Office',
        sourceUrl: 'https://www.auswaertiges-amt.de',
        visaType: 'student_visa',
        description: undefined,
        processingTime: '6-12 weeks',
        requirements: 'Passport, admission letter, proof of funds',
        isVerified: true,
        lastVerifiedAt: VERIFIED_AT,
        createdAt: CREATED_AT,
      });
      expect(mockedPrisma.countryVisaSource.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('filters by visa type', async () => {
      mockedPrisma.countryVisaSource.findMany.mockResolvedValue([
        mockVisaSourceRow({ id: 'visa-2', visaType: 'language_course_visa' }),
      ] as never);

      const result = await service.getCountryVisaSources('country-de', 'language_course_visa');

      expect(result).toHaveLength(1);
      expect(result[0].visaType).toBe('language_course_visa');
      expect(mockedPrisma.countryVisaSource.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de', visaType: 'language_course_visa' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getCountryCosts', () => {
    it('returns cost info for a country', async () => {
      mockedPrisma.countryCostInfo.findMany.mockResolvedValue([
        mockCostRow(),
        mockCostRow({ id: 'cost-2', category: 'living', averageCost: '12000', period: 'per_year' }),
      ] as never);

      const result = await service.getCountryCosts('country-de');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'cost-1',
        countryId: 'country-de',
        category: 'tuition',
        subcategory: 'public_university',
        averageCost: 350,
        currency: 'EUR',
        period: 'per_semester',
        sourceName: 'DAAD database',
        sourceUrl: undefined,
        isVerified: true,
        lastVerifiedAt: VERIFIED_AT,
        year: 2026,
        createdAt: CREATED_AT,
      });
      expect(result[1].averageCost).toBe(12000);
      expect(typeof result[1].averageCost).toBe('number');
      expect(mockedPrisma.countryCostInfo.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('filters by category', async () => {
      mockedPrisma.countryCostInfo.findMany.mockResolvedValue([
        mockCostRow({ id: 'cost-3', category: 'living' }),
      ] as never);

      const result = await service.getCountryCosts('country-de', 'living');

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('living');
      expect(mockedPrisma.countryCostInfo.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de', category: 'living' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getCountryScholarships', () => {
    it('returns scholarships for a country', async () => {
      mockedPrisma.countryScholarship.findMany.mockResolvedValue([
        mockScholarshipRow(),
      ] as never);

      const result = await service.getCountryScholarships('country-de');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'sch-1',
        countryId: 'country-de',
        name: 'DAAD Study Scholarship',
        provider: 'DAAD',
        type: 'merit_based',
        amount: 992,
        currency: 'EUR',
        coverage: 'monthly stipend',
        eligibility: 'International graduates',
        deadline: '2026-10-31',
        applicationUrl: 'https://www.daad.de/apply',
        description: undefined,
        isVerified: true,
        lastVerifiedAt: VERIFIED_AT,
        createdAt: CREATED_AT,
      });
      expect(mockedPrisma.countryScholarship.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('filters by scholarship type', async () => {
      mockedPrisma.countryScholarship.findMany.mockResolvedValue([
        mockScholarshipRow({ id: 'sch-2', name: 'Deutschlandstipendium', type: 'need_based' }),
      ] as never);

      const result = await service.getCountryScholarships('country-de', 'need_based');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('need_based');
      expect(mockedPrisma.countryScholarship.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de', type: 'need_based' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getCountryAdmissionReqs', () => {
    it('returns admission requirements for a country', async () => {
      mockedPrisma.countryAdmissionRequirement.findMany.mockResolvedValue([
        mockAdmissionReqRow(),
      ] as never);

      const result = await service.getCountryAdmissionReqs('country-de');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'req-1',
        countryId: 'country-de',
        level: 'bachelors',
        requirementType: 'language_proficiency',
        description: 'TestDaF or DSH certificate required',
        details: undefined,
        isVerified: true,
        lastVerifiedAt: VERIFIED_AT,
        createdAt: CREATED_AT,
      });
      expect(mockedPrisma.countryAdmissionRequirement.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('filters by education level', async () => {
      mockedPrisma.countryAdmissionRequirement.findMany.mockResolvedValue([
        mockAdmissionReqRow({ id: 'req-4', level: 'phd' }),
      ] as never);

      const result = await service.getCountryAdmissionReqs('country-de', 'phd');

      expect(result).toHaveLength(1);
      expect(result[0].level).toBe('phd');
      expect(mockedPrisma.countryAdmissionRequirement.findMany).toHaveBeenCalledWith({
        where: { countryId: 'country-de', level: 'phd' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getCountryComparison', () => {
    it('returns comparison data for multiple countries', async () => {
      mockedPrisma.countryProfile.findMany.mockResolvedValue([
        {
          ...mockCountryRow({
            id: 'country-ca',
            name: 'Canada',
            code: 'CA',
            currency: 'CAD',
            costOfLivingIndex: 71,
            safetyIndex: 85,
            qualityOfLifeIndex: 90,
          }),
          costInfo: [
            mockCostRow({ id: 'cost-t2', countryId: 'country-ca', category: 'Tuition Fees', averageCost: 7000 }),
            mockCostRow({ id: 'cost-l2', countryId: 'country-ca', category: 'living costs', averageCost: 10000 }),
          ],
        },
        {
          ...mockCountryRow(),
          costInfo: [
            mockCostRow({ id: 'cost-t1', category: 'Tuition Fees', averageCost: 4000 }),
            mockCostRow({ id: 'cost-t1b', category: 'tuition', subcategory: 'private_university', averageCost: 6000 }),
            mockCostRow({ id: 'cost-l1', category: 'Living Expenses', averageCost: 11000 }),
            mockCostRow({ id: 'cost-l1b', category: 'living costs', averageCost: 13000 }),
            mockCostRow({ id: 'cost-x1', category: 'Health Insurance', averageCost: 1200 }),
          ],
        },
      ] as never);

      const result = await service.getCountryComparison(['CA', 'DE']);

      expect(result.countries).toHaveLength(2);
      expect(result.countries[0]).toEqual({
        name: 'Canada',
        code: 'CA',
        currency: 'CAD',
        costOfLivingIndex: 71,
        safetyIndex: 85,
        qualityOfLifeIndex: 90,
        averageTuition: 7000,
        averageLivingCost: 10000,
      });
      expect(result.countries[1]).toEqual({
        name: 'Germany',
        code: 'DE',
        currency: 'EUR',
        costOfLivingIndex: 65,
        safetyIndex: 80,
        qualityOfLifeIndex: 88,
        averageTuition: 5000,
        averageLivingCost: 12000,
      });
      expect(mockedPrisma.countryProfile.findMany).toHaveBeenCalledWith({
        where: { code: { in: ['CA', 'DE'] } },
        include: { costInfo: true },
        orderBy: { name: 'asc' },
      });
    });

    it('handles single country comparison with missing cost categories', async () => {
      mockedPrisma.countryProfile.findMany.mockResolvedValue([
        {
          ...mockCountryRow(),
          costInfo: [
            mockCostRow({ category: 'Transport', averageCost: 90 }),
          ],
        },
      ] as never);

      const result = await service.getCountryComparison(['DE']);

      expect(result.countries).toHaveLength(1);
      expect(result.countries[0]).toEqual({
        name: 'Germany',
        code: 'DE',
        currency: 'EUR',
        costOfLivingIndex: 65,
        safetyIndex: 80,
        qualityOfLifeIndex: 88,
        averageTuition: undefined,
        averageLivingCost: undefined,
      });
      expect(mockedPrisma.countryProfile.findMany).toHaveBeenCalledWith({
        where: { code: { in: ['DE'] } },
        include: { costInfo: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('searchCountries', () => {
    it('returns countries matching by name', async () => {
      mockedPrisma.university.groupBy.mockResolvedValue([
        { country: 'germany', _count: { _all: 12 } },
      ] as never);
      mockedPrisma.countryProfile.findMany.mockResolvedValue([
        mockCountryRow({ _count: { scholarships: 8 } }),
      ] as never);

      const result = await service.searchCountries('Ger');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Germany');
      expect(result[0].universityCount).toBe(12);
      expect(result[0].scholarshipCount).toBe(8);
      expect(mockedPrisma.countryProfile.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'ger' } },
            { code: { contains: 'ger' } },
            { region: { contains: 'ger' } },
          ],
        },
        orderBy: { name: 'asc' },
        include: { _count: { select: { scholarships: true } } },
      });
    });

    it('returns countries matching by code', async () => {
      mockedPrisma.university.groupBy.mockResolvedValue([] as never);
      mockedPrisma.countryProfile.findMany.mockResolvedValue([
        mockCountryRow({ _count: { scholarships: 8 } }),
      ] as never);

      const result = await service.searchCountries('DE');

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('DE');
      expect(mockedPrisma.countryProfile.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'de' } },
            { code: { contains: 'de' } },
            { region: { contains: 'de' } },
          ],
        },
        orderBy: { name: 'asc' },
        include: { _count: { select: { scholarships: true } } },
      });
      expect(mockedPrisma.university.groupBy).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when nothing matches', async () => {
      mockedPrisma.university.groupBy.mockResolvedValue([] as never);
      mockedPrisma.countryProfile.findMany.mockResolvedValue([] as never);

      const result = await service.searchCountries('atlantis');

      expect(result).toEqual([]);
    });

    it('returns empty array without querying for blank query', async () => {
      const result = await service.searchCountries('   ');

      expect(result).toEqual([]);
      expect(mockedPrisma.countryProfile.findMany).not.toHaveBeenCalled();
      expect(mockedPrisma.university.groupBy).not.toHaveBeenCalled();
    });
  });

  describe('getPopularCountries', () => {
    it('delegates to getAllCountries with popular filter', async () => {
      mockedPrisma.university.groupBy.mockResolvedValue([] as never);
      mockedPrisma.countryProfile.findMany.mockResolvedValue([
        mockCountryRow({ _count: { scholarships: 8 } }),
      ] as never);

      const result = await service.getPopularCountries();

      expect(result).toHaveLength(1);
      expect(result[0].popularForStudents).toBe(true);
      expect(mockedPrisma.countryProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { popularForStudents: true } })
      );
    });
  });
});
