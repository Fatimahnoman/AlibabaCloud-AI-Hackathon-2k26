import { describe, it, expect, vi, beforeEach } from 'vitest';
import { retrieveEducationContext } from '@/services/ai/education-context';

vi.mock('@/lib/prisma', () => {
  const mock = {
    university: {
      findMany: vi.fn(),
    },
    scholarship: {
      findMany: vi.fn(),
    },
    careerPath: {
      findMany: vi.fn(),
    },
    visaInformation: {
      findMany: vi.fn(),
    },
    universityRanking: {
      findMany: vi.fn(),
    },
    country: {
      findFirst: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
const mockedPrisma = vi.mocked(prisma);

describe('retrieveEducationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty string for non-education intents', async () => {
    const result = await retrieveEducationContext('hello', 'general');

    expect(result).toBe('');
    expect(mockedPrisma.university.findMany).not.toHaveBeenCalled();
  });

  it('returns university context for university intent', async () => {
    const universities = [
      {
        id: 'uni-001',
        name: 'LUMS',
        city: 'Lahore',
        country: 'Pakistan',
        verificationStatus: 'verified',
        website: 'https://www.lums.edu.pk',
        courses: [{ name: 'BS CS', degree: 'bachelor', duration: '4 years', department: 'Computer Science' }],
        departments: [{ name: 'Computer Science', head: 'Dr. Smith', description: 'CS Department', totalCourses: 5 }],
        rankings: [{ provider: 'QS Asia', year: 2024, position: 112, category: 'Asia' }],
        campuses: [],
      },
    ];
    mockedPrisma.university.findMany.mockResolvedValue(universities as never);
    mockedPrisma.universityRanking.findMany.mockResolvedValue([] as never);

    const result = await retrieveEducationContext('Tell me about universities in Pakistan', 'university');

    expect(result).toContain('VERIFIED EDUCATION DATA');
    expect(result).toContain('LUMS');
    expect(result).toContain('BS CS');
  });

  it('returns scholarship context for scholarship intent', async () => {
    const scholarships = [
      {
        id: 'scholarship-001',
        name: 'Fulbright',
        provider: 'US State Dept',
        country: 'United States',
        verificationStatus: 'verified',
        deadline: new Date('2025-06-01'),
        sourceUrl: 'https://fulbright.org',
        requirements: [
          { requirementType: 'degree_level', requirementValue: 'master', isRequired: true },
        ],
      },
    ];
    mockedPrisma.scholarship.findMany.mockResolvedValue(scholarships as never);

    const result = await retrieveEducationContext('What scholarships are available?', 'scholarship');

    expect(result).toContain('VERIFIED EDUCATION DATA');
    expect(result).toContain('Fulbright');
  });

  it('returns career context for career intent', async () => {
    const careerPaths = [
      {
        id: 'career-001',
        title: 'Software Engineer',
        field: 'Computer Science',
        verificationStatus: 'verified',
        entryRoles: '["Junior Developer"]',
        skills: '["JavaScript", "Python"]',
      },
    ];
    mockedPrisma.careerPath.findMany.mockResolvedValue(careerPaths as never);

    const result = await retrieveEducationContext('Tell me about software engineer career paths', 'career');

    expect(result).toContain('VERIFIED EDUCATION DATA');
    expect(result).toContain('Software Engineer');
  });

  it('returns visa context for visa intent with country filter', async () => {
    const country = { id: 'country-002', name: 'Germany' };
    mockedPrisma.country.findFirst.mockResolvedValue(country as never);
    const visaInfo = [
      {
        id: 'visa-001',
        country: { name: 'Germany' },
        visaType: 'Student Visa',
        processingTime: '4-8 weeks',
        requirements: 'Valid passport, admission letter',
      },
    ];
    mockedPrisma.visaInformation.findMany.mockResolvedValue(visaInfo as never);

    const result = await retrieveEducationContext('visa for germany', 'visa');

    expect(result).toContain('VERIFIED EDUCATION DATA');
    expect(result).toContain('Student Visa');
    expect(mockedPrisma.country.findFirst).toHaveBeenCalledWith({
      where: { name: 'Germany' },
    });
  });

  it('returns rankings for university intent', async () => {
    mockedPrisma.university.findMany.mockResolvedValue([] as never);
    const rankings = [
      {
        id: 'ranking-003',
        position: 1,
        category: 'World',
        university: { name: 'MIT', country: 'United States' },
      },
    ];
    mockedPrisma.universityRanking.findMany.mockResolvedValue(rankings as never);

    const result = await retrieveEducationContext('university rankings', 'university');

    expect(result).toContain('University Rankings (QS 2024)');
    expect(result).toContain('#1 MIT');
  });

  it('handles database errors gracefully', async () => {
    mockedPrisma.university.findMany.mockRejectedValue(new Error('DB error'));

    const result = await retrieveEducationContext('universities', 'university');

    expect(result).toBe('');
  });

  it('returns empty string when no data found', async () => {
    mockedPrisma.university.findMany.mockResolvedValue([] as never);
    mockedPrisma.universityRanking.findMany.mockResolvedValue([] as never);

    const result = await retrieveEducationContext('obscure topic', 'university');

    expect(result).toBe('');
  });
});
