import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const mock = {
    course: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    university: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    scholarship: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    careerPath: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
import { EducationPlanner } from '@/services/orchestration/education-planner';
import type { OrchestrationQuery } from '@/services/orchestration/types';

const mockedPrisma = vi.mocked(prisma);

function makeQuery(overrides: Partial<OrchestrationQuery['entities']> = {}): OrchestrationQuery {
  return {
    userId: 'user-1',
    message: 'test',
    domains: ['education'],
    entities: {
      country: 'germany',
      field: 'Computer Science',
      degreeLevel: 'Master',
      ...overrides,
    },
  };
}

describe('EducationPlanner - planEducationPath', () => {
  const planner = new EducationPlanner();

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.course.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.university.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.scholarship.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.careerPath.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it('returns courses when country matches', async () => {
    (prisma.course.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'c1',
        name: 'MSc Computer Science',
        degree: 'Computer Science Master',
        university: { name: 'TU Munich', country: 'Germany' },
      },
      {
        id: 'c2',
        name: 'BSc Computer Science',
        degree: 'Computer Science Bachelor',
        university: { name: 'LMU Munich', country: 'Germany' },
      },
    ]);

    const query = makeQuery();
    const result = await planner.planEducationPath(query);

    expect(result.courses.length).toBe(2);
    expect(result.courses[0].name).toBe('MSc Computer Science');
    expect(result.courses[0].university).toBe('TU Munich');
    expect(result.courses[0].universityCountry).toBe('Germany');
    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 8 })
    );
  });

  it('returns scholarships sorted by deadline', async () => {
    const laterDate = new Date('2026-12-01');
    const earlierDate = new Date('2026-06-01');

    (prisma.scholarship.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 's1',
        name: 'DAAD Scholarship',
        provider: 'DAAD',
        amount: 500,
        deadline: laterDate,
        country: 'Germany',
        verificationStatus: 'verified',
        requirements: [{ requirementType: 'degree_level', requirementValue: 'Master' }],
      },
      {
        id: 's2',
        name: 'Erasmus Mundus',
        provider: 'EU',
        amount: 1000,
        deadline: earlierDate,
        country: 'Germany',
        verificationStatus: 'verified',
        requirements: [{ requirementType: 'degree_level', requirementValue: 'Master' }],
      },
    ]);

    const query = makeQuery();
    const result = await planner.planEducationPath(query);

    expect(result.scholarships.length).toBe(2);
    expect(prisma.scholarship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { deadline: 'asc' },
        take: 6,
      })
    );
  });

  it('returns career paths matching field', async () => {
    (prisma.careerPath.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        title: 'Software Engineer',
        field: 'Computer Science',
        skills: JSON.stringify(['Python', 'JavaScript', 'Algorithms']),
        entryRoles: JSON.stringify(['Junior Developer', 'Intern']),
      },
      {
        title: 'Data Scientist',
        field: 'Computer Science',
        skills: JSON.stringify(['Python', 'R', 'Statistics']),
        entryRoles: JSON.stringify(['Data Analyst', 'ML Engineer']),
      },
    ]);

    const query = makeQuery();
    const result = await planner.planEducationPath(query);

    expect(result.careerPaths.length).toBe(2);
    expect(result.careerPaths[0].title).toBe('Software Engineer');
    expect(result.careerPaths[0].skills).toEqual(['Python', 'JavaScript', 'Algorithms']);
    expect(prisma.careerPath.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 4 })
    );
  });

  it('returns universities with rankings', async () => {
    (prisma.university.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'u1',
        name: 'TU Munich',
        country: 'Germany',
        type: 'public',
        verificationStatus: 'verified',
        rankings: [{ provider: 'QS', position: 50 }],
      },
    ]);

    const query = makeQuery();
    const result = await planner.planEducationPath(query);

    expect(result.universities.length).toBe(1);
    expect(result.universities[0].name).toBe('TU Munich');
    expect(result.universities[0].rankings[0].provider).toBe('QS');
    expect(result.universities[0].rankings[0].position).toBe(50);
  });

  it('evaluates scholarship match strength as strong when country and degree match', async () => {
    (prisma.scholarship.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 's1',
        name: 'DAAD Master Scholarship',
        provider: 'DAAD',
        amount: 800,
        deadline: new Date('2026-09-01'),
        country: 'Germany',
        verificationStatus: 'verified',
        requirements: [{ requirementType: 'degree_level', requirementValue: 'Master' }],
      },
    ]);

    const query = makeQuery();
    const result = await planner.planEducationPath(query);

    expect(result.scholarships[0].matchStrength).toBe('strong');
  });

  it('evaluates scholarship match strength as possible when only country matches', async () => {
    (prisma.scholarship.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 's1',
        name: 'Generic Scholarship',
        provider: 'Foundation',
        amount: 500,
        deadline: new Date('2026-09-01'),
        country: 'Germany',
        verificationStatus: 'verified',
        requirements: [{ requirementType: 'degree_level', requirementValue: 'Bachelor' }],
      },
    ]);

    const query = makeQuery({ degreeLevel: 'Master' });
    const result = await planner.planEducationPath(query);

    expect(result.scholarships[0].matchStrength).toBe('possible');
  });

  it('evaluates scholarship match strength as not_eligible when nothing matches', async () => {
    (prisma.scholarship.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 's1',
        name: 'US Only Scholarship',
        provider: 'US Foundation',
        amount: 1000,
        deadline: new Date('2026-09-01'),
        country: 'USA',
        verificationStatus: 'verified',
        requirements: [{ requirementType: 'degree_level', requirementValue: 'PhD' }],
      },
    ]);

    const query = makeQuery({ country: 'germany', degreeLevel: 'Master' });
    const result = await planner.planEducationPath(query);

    expect(result.scholarships[0].matchStrength).toBe('not_eligible');
  });

  it('handles empty results gracefully', async () => {
    const query = makeQuery({ country: 'narnia', field: 'Magic' });
    const result = await planner.planEducationPath(query);

    expect(result.courses).toEqual([]);
    expect(result.universities).toEqual([]);
    expect(result.scholarships).toEqual([]);
    expect(result.careerPaths).toEqual([]);
    expect(result.field).toBe('Magic');
    expect(result.country).toBe('narnia');
  });

  it('sets defaults when entities are missing', async () => {
    const query = makeQuery();
    delete query.entities.country;
    delete query.entities.field;
    delete query.entities.degreeLevel;

    const result = await planner.planEducationPath(query);

    expect(result.field).toBe('General');
    expect(result.degreeLevel).toBe('Bachelor');
    expect(result.country).toBe('Any');
  });

  it('handles scholarship with no amount gracefully', async () => {
    (prisma.scholarship.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 's1',
        name: 'No Amount Scholarship',
        provider: 'Org',
        amount: null,
        deadline: null,
        country: 'Germany',
        verificationStatus: 'pending',
        requirements: [],
      },
    ]);

    const query = makeQuery();
    const result = await planner.planEducationPath(query);

    expect(result.scholarships[0].amount).toBeUndefined();
    expect(result.scholarships[0].deadline).toBeUndefined();
    expect(result.scholarships[0].degreeLevel).toBe('Any');
  });
});
