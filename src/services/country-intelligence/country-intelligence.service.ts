import prisma from '@/lib/prisma';
import type {
  CountryProfile,
  CountryEducationAuthority,
  CountryVisaSource,
  CountryReportingAuthority,
  CountryCostInfo,
  CountryScholarship,
  CountryAdmissionRequirement,
  CountryDetail,
  CountrySummary,
  CountryComparison,
} from '@/types/education-student';

function average(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

async function getUniversityCounts(): Promise<Map<string, number>> {
  const grouped = await prisma.university.groupBy({
    by: ['country'],
    _count: { _all: true },
  });
  const map = new Map<string, number>();
  for (const g of grouped) {
    map.set(g.country.toLowerCase(), g._count._all);
  }
  return map;
}

function toCountryProfile(row: any): CountryProfile {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    region: row.region ?? undefined,
    capital: row.capital ?? undefined,
    currency: row.currency,
    language: row.language,
    educationSystem: row.educationSystem ?? undefined,
    timezone: row.timezone ?? undefined,
    costOfLivingIndex: row.costOfLivingIndex ?? undefined,
    qualityOfLifeIndex: row.qualityOfLifeIndex ?? undefined,
    safetyIndex: row.safetyIndex ?? undefined,
    popularForStudents: row.popularForStudents,
    profileImageUrl: row.profileImageUrl ?? undefined,
    overview: row.overview ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toAuthority(row: any): CountryEducationAuthority {
  return {
    id: row.id,
    countryId: row.countryId,
    name: row.name,
    acronym: row.acronym ?? undefined,
    type: row.type,
    description: row.description ?? undefined,
    websiteUrl: row.websiteUrl ?? undefined,
    isVerified: row.isVerified,
    lastVerifiedAt: row.lastVerifiedAt ?? undefined,
    createdAt: row.createdAt,
  };
}

function toVisaSource(row: any): CountryVisaSource {
  return {
    id: row.id,
    countryId: row.countryId,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl ?? undefined,
    visaType: row.visaType,
    description: row.description ?? undefined,
    processingTime: row.processingTime ?? undefined,
    requirements: row.requirements ?? undefined,
    isVerified: row.isVerified,
    lastVerifiedAt: row.lastVerifiedAt ?? undefined,
    createdAt: row.createdAt,
  };
}

function toReportingBody(row: any): CountryReportingAuthority {
  return {
    id: row.id,
    countryId: row.countryId,
    name: row.name,
    type: row.type,
    description: row.description ?? undefined,
    websiteUrl: row.websiteUrl ?? undefined,
    contactEmail: row.contactEmail ?? undefined,
    contactPhone: row.contactPhone ?? undefined,
    isVerified: row.isVerified,
    lastVerifiedAt: row.lastVerifiedAt ?? undefined,
    createdAt: row.createdAt,
  };
}

function toCostInfo(row: any): CountryCostInfo {
  return {
    id: row.id,
    countryId: row.countryId,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    averageCost: Number(row.averageCost),
    currency: row.currency,
    period: row.period ?? undefined,
    sourceName: row.sourceName ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    isVerified: row.isVerified,
    lastVerifiedAt: row.lastVerifiedAt ?? undefined,
    year: row.year ?? undefined,
    createdAt: row.createdAt,
  };
}

function toScholarship(row: any): CountryScholarship {
  return {
    id: row.id,
    countryId: row.countryId,
    name: row.name,
    provider: row.provider,
    type: row.type,
    amount: row.amount ?? undefined,
    currency: row.currency ?? undefined,
    coverage: row.coverage ?? undefined,
    eligibility: row.eligibility ?? undefined,
    deadline: row.deadline ?? undefined,
    applicationUrl: row.applicationUrl ?? undefined,
    description: row.description ?? undefined,
    isVerified: row.isVerified,
    lastVerifiedAt: row.lastVerifiedAt ?? undefined,
    createdAt: row.createdAt,
  };
}

function toAdmissionRequirement(row: any): CountryAdmissionRequirement {
  return {
    id: row.id,
    countryId: row.countryId,
    level: row.level,
    requirementType: row.requirementType,
    description: row.description,
    details: row.details ?? undefined,
    isVerified: row.isVerified,
    lastVerifiedAt: row.lastVerifiedAt ?? undefined,
    createdAt: row.createdAt,
  };
}

function toCountrySummary(row: any, universityCounts: Map<string, number>): CountrySummary {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    region: row.region ?? undefined,
    currency: row.currency,
    language: row.language,
    popularForStudents: row.popularForStudents,
    costOfLivingIndex: row.costOfLivingIndex ?? undefined,
    universityCount: universityCounts.get(row.name.toLowerCase()) ?? 0,
    scholarshipCount: row._count?.scholarships ?? 0,
  };
}

function toCountryDetail(row: any): CountryDetail {
  return {
    ...toCountryProfile(row),
    authorities: ((row as any).authorities ?? []).map(toAuthority),
    visaSources: ((row as any).visaSources ?? []).map(toVisaSource),
    reportingBodies: ((row as any).reportingBodies ?? []).map(toReportingBody),
    costInfo: ((row as any).costInfo ?? []).map(toCostInfo),
    scholarships: ((row as any).scholarships ?? []).map(toScholarship),
    admissionReqs: ((row as any).admissionReqs ?? []).map(toAdmissionRequirement),
  };
}

export class CountryIntelligenceService {
  async getAllCountries(filters?: { region?: string; popular?: boolean }): Promise<CountrySummary[]> {
    const where: any = {};
    if (filters?.region) where.region = filters.region;
    if (filters?.popular !== undefined) where.popularForStudents = filters.popular;
    const [rows, universityCounts] = await Promise.all([
      prisma.countryProfile.findMany({
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { scholarships: true } } },
      }),
      getUniversityCounts(),
    ]);
    return rows.map((r) => toCountrySummary(r, universityCounts));
  }

  async getCountryByCode(code: string): Promise<CountryDetail | null> {
    const row = await prisma.countryProfile.findUnique({
      where: { code },
      include: {
        authorities: true,
        visaSources: true,
        reportingBodies: true,
        costInfo: true,
        scholarships: true,
        admissionReqs: true,
      },
    });
    if (!row) return null;
    return toCountryDetail(row);
  }

  async getCountryAuthorities(countryId: string, type?: string): Promise<CountryEducationAuthority[]> {
    const where: any = { countryId };
    if (type) where.type = type;
    const rows = await prisma.countryEducationAuthority.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toAuthority);
  }

  async getCountryVisaSources(countryId: string, visaType?: string): Promise<CountryVisaSource[]> {
    const where: any = { countryId };
    if (visaType) where.visaType = visaType;
    const rows = await prisma.countryVisaSource.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toVisaSource);
  }

  async getCountryCosts(countryId: string, category?: string): Promise<CountryCostInfo[]> {
    const where: any = { countryId };
    if (category) where.category = category;
    const rows = await prisma.countryCostInfo.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toCostInfo);
  }

  async getCountryScholarships(countryId: string, type?: string): Promise<CountryScholarship[]> {
    const where: any = { countryId };
    if (type) where.type = type;
    const rows = await prisma.countryScholarship.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toScholarship);
  }

  async getCountryAdmissionReqs(countryId: string, level?: string): Promise<CountryAdmissionRequirement[]> {
    const where: any = { countryId };
    if (level) where.level = level;
    const rows = await prisma.countryAdmissionRequirement.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toAdmissionRequirement);
  }

  async getCountryComparison(codes: string[]): Promise<CountryComparison> {
    const rows = await prisma.countryProfile.findMany({
      where: { code: { in: codes } },
      include: { costInfo: true },
      orderBy: { name: 'asc' },
    });
    return {
      countries: rows.map((row) => {
        const costs = (((row as any).costInfo ?? []) as any[]).map(toCostInfo);
        const tuitionValues = costs.filter((c) => c.category.toLowerCase().includes('tuition')).map((c) => c.averageCost);
        const livingValues = costs.filter((c) => c.category.toLowerCase().includes('living')).map((c) => c.averageCost);
        return {
          name: row.name,
          code: row.code,
          currency: row.currency,
          costOfLivingIndex: row.costOfLivingIndex ?? undefined,
          safetyIndex: row.safetyIndex ?? undefined,
          qualityOfLifeIndex: row.qualityOfLifeIndex ?? undefined,
          averageTuition: average(tuitionValues),
          averageLivingCost: average(livingValues),
        };
      }),
    };
  }

  async getPopularCountries(): Promise<CountrySummary[]> {
    return this.getAllCountries({ popular: true });
  }

  async searchCountries(query: string): Promise<CountrySummary[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const [rows, universityCounts] = await Promise.all([
      prisma.countryProfile.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { code: { contains: q } },
            { region: { contains: q } },
          ],
        },
        orderBy: { name: 'asc' },
        include: { _count: { select: { scholarships: true } } },
      }),
      getUniversityCounts(),
    ]);
    return rows.map((r) => toCountrySummary(r, universityCounts));
  }
}

export const countryIntelligenceService = new CountryIntelligenceService();
