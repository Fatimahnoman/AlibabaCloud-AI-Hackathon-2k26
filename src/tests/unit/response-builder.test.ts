import { describe, it, expect } from 'vitest';

import { ResponseBuilder } from '@/services/orchestration/response-builder';
import type { OrchestrationQuery, EducationPath } from '@/services/orchestration/types';

function makeQuery(country = 'germany'): OrchestrationQuery {
  return {
    userId: 'user-1',
    message: 'test',
    domains: ['education'],
    entities: {
      country,
      field: 'Computer Science',
      degreeLevel: 'Master',
    },
  };
}

function makeEducationPath(overrides: Partial<EducationPath> = {}): EducationPath {
  return {
    field: 'Computer Science',
    degreeLevel: 'Master',
    country: 'Germany',
    courses: [],
    universities: [],
    scholarships: [],
    careerPaths: [],
    ...overrides,
  };
}

describe('ResponseBuilder - buildResponse', () => {
  const builder = new ResponseBuilder();

  it('returns complete result with all required sections', () => {
    const query = makeQuery();
    const educationPath = makeEducationPath();
    const result = builder.buildResponse(query, educationPath);

    expect(result).toHaveProperty('query', query);
    expect(result).toHaveProperty('educationPath', educationPath);
    expect(result).toHaveProperty('budgetEstimate');
    expect(result).toHaveProperty('documents');
    expect(result).toHaveProperty('roadmap');
    expect(result).toHaveProperty('nextActions');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('sources');
    expect(result).toHaveProperty('generatedAt');
  });

  it('includes sources collected from education path', () => {
    const educationPath = makeEducationPath({
      universities: [
        {
          id: 'u1',
          name: 'TU Munich',
          country: 'Germany',
          type: 'public',
          rankings: [{ provider: 'QS', position: 50 }],
          verificationStatus: 'verified',
        },
      ],
      scholarships: [
        {
          id: 's1',
          name: 'DAAD',
          provider: 'DAAD',
          amount: '5000',
          deadline: new Date(),
          degreeLevel: 'Master',
          matchStrength: 'strong',
          verificationStatus: 'verified',
        },
      ],
    });

    const result = builder.buildResponse(makeQuery(), educationPath);

    expect(result.sources.length).toBe(2);
    expect(result.sources[0].name).toBe('TU Munich');
    expect(result.sources[1].name).toBe('DAAD');
  });
});

describe('ResponseBuilder - estimateBudget', () => {
  const builder = new ResponseBuilder();

  it('calculates correct ranges for Germany (low tuition)', () => {
    const educationPath = makeEducationPath({ scholarships: [] });
    const result = builder.buildResponse(makeQuery('germany'), educationPath);

    expect(result.budgetEstimate.currency).toBe('USD');
    expect(result.budgetEstimate.tuitionRange?.min).toBe(0);
    expect(result.budgetEstimate.tuitionRange?.max).toBe(3000);
    expect(result.budgetEstimate.livingCostRange?.min).toBe(9600);
    expect(result.budgetEstimate.livingCostRange?.max).toBe(14400);
  });

  it('calculates correct ranges for USA (high tuition)', () => {
    const educationPath = makeEducationPath({ scholarships: [] });
    const result = builder.buildResponse(makeQuery('usa'), educationPath);

    expect(result.budgetEstimate.tuitionRange?.min).toBe(20000);
    expect(result.budgetEstimate.tuitionRange?.max).toBe(60000);
    expect(result.budgetEstimate.livingCostRange?.min).toBe(12000);
    expect(result.budgetEstimate.livingCostRange?.max).toBe(30000);
  });

  it('calculates scholarship savings when strong match exists', () => {
    const educationPath = makeEducationPath({
      scholarships: [
        {
          id: 's1',
          name: 'DAAD',
          provider: 'DAAD',
          amount: '5000',
          deadline: new Date(),
          degreeLevel: 'Master',
          matchStrength: 'strong',
          verificationStatus: 'verified',
        },
      ],
    });

    const result = builder.buildResponse(makeQuery('germany'), educationPath);

    expect(result.budgetEstimate.scholarshipSavings).toBeGreaterThan(0);
    expect(result.budgetEstimate.netEstimate?.max).toBeLessThan(
      result.budgetEstimate.totalEstimate?.max ?? Infinity
    );
  });

  it('sets isAffordable when user budget is provided', () => {
    const educationPath = makeEducationPath({ scholarships: [] });
    const userBudget = { monthlyIncome: 50000, savingsGoal: 10000 };
    const result = builder.buildResponse(makeQuery('germany'), educationPath, userBudget);

    expect(result.budgetEstimate.userBudget).toBe(600000);
    expect(result.budgetEstimate.isAffordable).toBeDefined();
  });
});

describe('ResponseBuilder - buildDocumentChecklist', () => {
  const builder = new ResponseBuilder();

  it('returns essential and recommended items', () => {
    const result = builder.buildResponse(makeQuery(), makeEducationPath());

    expect(result.documents.category).toBe('Study Abroad Application');
    expect(result.documents.items.length).toBeGreaterThan(0);

    const essentials = result.documents.items.filter(i => i.priority === 'essential');
    const recommended = result.documents.items.filter(i => i.priority === 'recommended');
    const optional = result.documents.items.filter(i => i.priority === 'optional');

    expect(essentials.length).toBeGreaterThan(0);
    expect(recommended.length).toBeGreaterThan(0);
    expect(optional.length).toBeGreaterThan(0);
  });

  it('all items have pending status', () => {
    const result = builder.buildResponse(makeQuery(), makeEducationPath());
    result.documents.items.forEach(item => {
      expect(item.status).toBe('pending');
    });
  });
});

describe('ResponseBuilder - buildRoadmap', () => {
  const builder = new ResponseBuilder();

  it('returns 6 phases', () => {
    const result = builder.buildResponse(makeQuery(), makeEducationPath());

    expect(result.roadmap.length).toBe(6);
    expect(result.roadmap[0].phase).toBe(1);
    expect(result.roadmap[5].phase).toBe(6);
  });

  it('each phase has title, timeframe, and tasks', () => {
    const result = builder.buildResponse(makeQuery(), makeEducationPath());

    result.roadmap.forEach(step => {
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('timeframe');
      expect(step).toHaveProperty('tasks');
      expect(step.tasks.length).toBeGreaterThan(0);
      expect(step.verified).toBe(false);
    });
  });
});

describe('ResponseBuilder - formatAsMessage', () => {
  const builder = new ResponseBuilder();

  it('returns markdown with all major sections', () => {
    const educationPath = makeEducationPath({
      courses: [
        {
          id: 'c1',
          name: 'MSc CS',
          university: 'TU Munich',
          universityCountry: 'Germany',
          degree: 'Master',
          careerPaths: [],
        },
      ],
      universities: [
        {
          id: 'u1',
          name: 'TU Munich',
          country: 'Germany',
          type: 'public',
          rankings: [{ provider: 'QS', position: 50 }],
          verificationStatus: 'verified',
        },
      ],
    });

    const result = builder.buildResponse(makeQuery(), educationPath);
    const message = builder.formatAsMessage(result);

    expect(message).toContain('## Your Personalized Education Plan');
    expect(message).toContain('### Matching Courses');
    expect(message).toContain('### University Shortlist');
    expect(message).toContain('### Estimated Budget');
    expect(message).toContain('### Documents Checklist');
    expect(message).toContain('### Roadmap');
  });

  it('includes scholarship section when scholarships exist', () => {
    const educationPath = makeEducationPath({
      scholarships: [
        {
          id: 's1',
          name: 'DAAD Scholarship',
          provider: 'DAAD',
          amount: '5000',
          deadline: new Date(),
          degreeLevel: 'Master',
          matchStrength: 'strong',
          verificationStatus: 'verified',
        },
      ],
    });

    const result = builder.buildResponse(makeQuery(), educationPath);
    const message = builder.formatAsMessage(result);

    expect(message).toContain('### Scholarship Matches');
    expect(message).toContain('DAAD Scholarship');
  });

  it('excludes not_eligible scholarships from message', () => {
    const educationPath = makeEducationPath({
      scholarships: [
        {
          id: 's1',
          name: 'Ineligible Scholarship',
          provider: 'Org',
          amount: '1000',
          deadline: new Date(),
          degreeLevel: 'PhD',
          matchStrength: 'not_eligible',
          verificationStatus: 'verified',
        },
      ],
    });

    const result = builder.buildResponse(makeQuery(), educationPath);
    const message = builder.formatAsMessage(result);

    expect(message).not.toContain('Ineligible Scholarship');
  });
});

describe('ResponseBuilder - calculateConfidence', () => {
  const builder = new ResponseBuilder();

  it('returns 100 when all data is present', () => {
    const educationPath = makeEducationPath({
      courses: [{ id: 'c1', name: 'X', university: 'Y', universityCountry: 'Z', degree: 'D', careerPaths: [] }],
      universities: [{ id: 'u1', name: 'U', country: 'C', type: 't', rankings: [], verificationStatus: 'v' }],
      scholarships: [{ id: 's1', name: 'S', provider: 'P', degreeLevel: 'M', matchStrength: 'strong', verificationStatus: 'v' }],
      careerPaths: [{ title: 'T', field: 'F', skills: [], entryRoles: [] }],
    });

    const result = builder.buildResponse(makeQuery(), educationPath);

    expect(result.confidence).toBe(100);
  });

  it('returns 0 when no data is present', () => {
    const educationPath = makeEducationPath();
    const result = builder.buildResponse(makeQuery(), educationPath);

    expect(result.confidence).toBe(0);
  });

  it('returns 50 when two data sources are present', () => {
    const educationPath = makeEducationPath({
      courses: [{ id: 'c1', name: 'X', university: 'Y', universityCountry: 'Z', degree: 'D', careerPaths: [] }],
      universities: [{ id: 'u1', name: 'U', country: 'C', type: 't', rankings: [], verificationStatus: 'v' }],
    });

    const result = builder.buildResponse(makeQuery(), educationPath);

    expect(result.confidence).toBe(50);
  });
});

describe('ResponseBuilder - determineNextActions', () => {
  const builder = new ResponseBuilder();

  it('suggests actions when courses are empty', () => {
    const educationPath = makeEducationPath();
    const result = builder.buildResponse(makeQuery(), educationPath);

    const eduActions = result.nextActions.filter(a => a.domain === 'education');
    expect(eduActions.length).toBeGreaterThan(0);
  });

  it('suggests scholarship action when no scholarships found', () => {
    const educationPath = makeEducationPath();
    const result = builder.buildResponse(makeQuery(), educationPath);

    const scholarshipActions = result.nextActions.filter(a => a.domain === 'scholarship');
    expect(scholarshipActions.length).toBeGreaterThan(0);
  });

  it('limits next actions to 5', () => {
    const educationPath = makeEducationPath();
    const result = builder.buildResponse(makeQuery(), educationPath);

    expect(result.nextActions.length).toBeLessThanOrEqual(5);
  });
});

describe('ResponseBuilder - isMultiDomainQuery (via buildResponse)', () => {
  const builder = new ResponseBuilder();

  it('builds correct result for multi-domain education+scholarship query', () => {
    const query: OrchestrationQuery = {
      userId: 'user-1',
      message: 'I want to study CS in Germany with scholarship and budget',
      domains: ['education', 'scholarship', 'budget'],
      entities: { country: 'germany', field: 'Computer Science' },
    };

    const result = builder.buildResponse(query, makeEducationPath());

    expect(result.query.domains).toContain('education');
    expect(result.query.domains).toContain('scholarship');
    expect(result.query.domains).toContain('budget');
  });

  it('builds correct result for single-domain query', () => {
    const query: OrchestrationQuery = {
      userId: 'user-1',
      message: 'Tell me about Germany',
      domains: ['general'],
      entities: { country: 'germany' },
    };

    const result = builder.buildResponse(query, makeEducationPath());

    expect(result.query.domains).toEqual(['general']);
    expect(result.confidence).toBe(0);
  });
});
