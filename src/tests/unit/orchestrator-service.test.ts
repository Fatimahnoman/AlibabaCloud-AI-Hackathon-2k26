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
    source: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  };
  return { default: mock };
});

vi.mock('@/services/budget/budget.service', () => ({
  budgetService: {
    getBudgetProfile: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/services/sources/source.service', () => ({
  sourceService: {
    getSourceStats: vi.fn().mockResolvedValue({ verified: 5 }),
  },
}));

import prisma from '@/lib/prisma';
import { OrchestratorService } from '@/services/orchestration/orchestrator.service';

const mockedPrisma = vi.mocked(prisma);

describe('OrchestratorService - classifyDomains', () => {
  const service = new OrchestratorService();

  it('identifies education domain from university keywords', () => {
    const domains = service.classifyDomains('Tell me about university options in Germany');
    expect(domains).toContain('education');
  });

  it('identifies scholarship domain from scholarship keywords', () => {
    const domains = service.classifyDomains('Are there any funded scholarships available?');
    expect(domains).toContain('scholarship');
  });

  it('identifies budget domain from cost keywords', () => {
    const domains = service.classifyDomains('How much does it cost to study abroad?');
    expect(domains).toContain('budget');
  });

  it('identifies career domain from job keywords', () => {
    const domains = service.classifyDomains('What career options are there after a degree?');
    expect(domains).toContain('career');
  });

  it('identifies multiple domains in a complex query', () => {
    const domains = service.classifyDomains(
      'I want to study CS in Germany with a scholarship and have a limited budget for my career'
    );
    expect(domains).toContain('education');
    expect(domains).toContain('scholarship');
    expect(domains).toContain('budget');
    expect(domains).toContain('career');
  });

  it('returns general for unrecognized queries', () => {
    const domains = service.classifyDomains('What is the weather today?');
    expect(domains).toEqual(['general']);
  });
});

describe('OrchestratorService - extractEntities', () => {
  const service = new OrchestratorService();

  it('extracts country from text', () => {
    const entities = service.extractEntities('I want to study in Germany');
    expect(entities.country).toBe('germany');
  });

  it('extracts country (usa) from text', () => {
    const entities = service.extractEntities('Universities in the United States');
    expect(entities.country).toBe('united states');
  });

  it('extracts country (uk) from text', () => {
    const entities = service.extractEntities('Study in the United Kingdom');
    expect(entities.country).toBe('united kingdom');
  });

  it('extracts field of study from text', () => {
    const entities = service.extractEntities('I want to study computer science');
    expect(entities.field).toBe('Computer Science');
  });

  it('extracts engineering field from text', () => {
    const entities = service.extractEntities('Engineering programs in Canada');
    expect(entities.field).toBe('Engineering');
  });

  it('extracts medicine field from text', () => {
    const entities = service.extractEntities('Medicine degree in Australia');
    expect(entities.field).toBe('Medicine');
  });

  it('extracts degree level (master) from text', () => {
    const entities = service.extractEntities('I want a master degree');
    expect(entities.degreeLevel).toBe('Master');
  });

  it('extracts degree level (phd) from text', () => {
    const entities = service.extractEntities('PhD programs in AI');
    expect(entities.degreeLevel).toBe('PhD');
  });

  it('extracts degree level (bachelor) from text', () => {
    const entities = service.extractEntities('Bachelor degree in UK');
    expect(entities.degreeLevel).toBe('Bachelor');
  });

  it('extracts budget amount from text', () => {
    const entities = service.extractEntities('My budget is 20000 dollars');
    expect(entities.budget).toBe(20000);
  });

  it('extracts budget with $ symbol from text', () => {
    const entities = service.extractEntities('I have a $50,000 budget');
    expect(entities.budget).toBe(50000);
  });

  it('extracts nationality (Pakistani) from text', () => {
    const entities = service.extractEntities('I am a Pakistani student');
    expect(entities.nationality).toBe('Pakistani');
  });

  it('extracts nationality (Indian) from text', () => {
    const entities = service.extractEntities('I am an Indian student');
    expect(entities.nationality).toBe('Indian');
  });
});

describe('OrchestratorService - isMultiDomainQuery', () => {
  const service = new OrchestratorService();

  it('returns true for a complex multi-domain query', () => {
    expect(service.isMultiDomainQuery('Study CS in Germany with scholarship and budget')).toBe(true);
  });

  it('returns false for a single-domain query', () => {
    expect(service.isMultiDomainQuery('Tell me about Germany')).toBe(false);
  });

  it('returns false for a completely general query', () => {
    expect(service.isMultiDomainQuery('Hello there')).toBe(false);
  });
});

describe('OrchestratorService - orchestrate', () => {
  const service = new OrchestratorService();

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.course.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.university.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.scholarship.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.careerPath.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it('calls education planner and returns a complete result', async () => {
    const query = {
      userId: 'user-1',
      message: 'I want to study computer science in Germany',
      domains: [] as string[],
      entities: {},
    };

    const result = await service.orchestrate(query);

    expect(result).toHaveProperty('query');
    expect(result).toHaveProperty('educationPath');
    expect(result).toHaveProperty('budgetEstimate');
    expect(result).toHaveProperty('documents');
    expect(result).toHaveProperty('roadmap');
    expect(result).toHaveProperty('nextActions');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('sources');
    expect(result).toHaveProperty('generatedAt');
    expect(prisma.course.findMany).toHaveBeenCalled();
  });

  it('returns result with matched courses from database', async () => {
    (prisma.course.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'c1',
        name: 'MSc Computer Science',
        degree: 'Computer Science Master',
        university: { name: 'TU Munich', country: 'Germany' },
      },
    ]);

    const query = {
      userId: 'user-2',
      message: 'Masters in computer science in Germany',
      domains: [] as string[],
      entities: {},
    };

    const result = await service.orchestrate(query);

    expect(result.educationPath.courses.length).toBe(1);
    expect(result.educationPath.courses[0].name).toBe('MSc Computer Science');
    expect(result.educationPath.courses[0].university).toBe('TU Munich');
  });
});

describe('OrchestratorService - formatResultAsAIContext', () => {
  const service = new OrchestratorService();

  it('returns a formatted string with all sections', async () => {
    (prisma.course.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.university.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.scholarship.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.careerPath.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const query = {
      userId: 'user-3',
      message: 'Study in Germany',
      domains: [] as string[],
      entities: {},
    };

    const result = await service.orchestrate(query);
    const formatted = service.formatResultAsAIContext(result);

    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('## Your Personalized Education Plan');
    expect(formatted).toContain('### Estimated Budget');
    expect(formatted).toContain('### Documents Checklist');
    expect(formatted).toContain('### Roadmap');
  });
});
