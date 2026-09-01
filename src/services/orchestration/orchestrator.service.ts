import { educationPlanner } from './education-planner';
import { responseBuilder } from './response-builder';
import { budgetService } from '@/services/budget/budget.service';
import { sourceService } from '@/services/sources/source.service';
import type { OrchestrationQuery, OrchestrationResult, OrchestrationDomain } from './types';

export class OrchestratorService {
  async orchestrate(query: OrchestrationQuery): Promise<OrchestrationResult> {
    const domains = this.classifyDomains(query.message);
    query.domains = domains;

    query.entities = this.extractEntities(query.message);

    const educationPath = await educationPlanner.planEducationPath(query);

    let userBudget: { monthlyIncome?: number; savingsGoal?: number } | undefined;
    if (domains.includes('budget')) {
      try {
        const profile = await budgetService.getBudgetProfile(query.userId);
        if (profile) {
          userBudget = {
            monthlyIncome: profile.monthlyIncome,
            savingsGoal: profile.savingsGoal,
          };
        }
      } catch {
        // Budget not available, continue without it
      }
    }

    const result = responseBuilder.buildResponse(query, educationPath, userBudget);

    try {
      const stats = await sourceService.getSourceStats();
      result.sources = result.sources.map(s => ({
        ...s,
        verified: stats.verified > 0,
      }));
    } catch {
      // Continue without source stats
    }

    return result;
  }

  classifyDomains(message: string): OrchestrationDomain[] {
    const lower = message.toLowerCase();
    const domains: OrchestrationDomain[] = [];

    if (/university|college|course|degree|bachelor|master|phd|study|program|admission/.test(lower)) domains.push('education');
    if (/scholarship|funded|tuition|fee/.test(lower)) domains.push('scholarship');
    if (/budget|money|cost|afford|expensive|cheap|savings/.test(lower)) domains.push('budget');
    if (/career|job|salary|work|employment/.test(lower)) domains.push('career');
    if (/fraud|scam|phishing|safe|legit/.test(lower)) domains.push('fraud');
    if (/study plan|exam|timetable|schedule/.test(lower)) domains.push('study');
    if (/teacher|lesson|quiz|rubric/.test(lower)) domains.push('teacher');

    if (domains.length === 0) domains.push('general');
    return domains;
  }

  extractEntities(message: string): OrchestrationQuery['entities'] {
    const lower = message.toLowerCase();
    const entities: OrchestrationQuery['entities'] = {};

    const countries = ['germany', 'usa', 'united states', 'uk', 'united kingdom', 'canada', 'australia', 'pakistan', 'india', 'uae', 'dubai', 'netherlands', 'france', 'japan', 'china', 'turkey', 'italy', 'spain'];
    for (const c of countries) {
      if (lower.includes(c)) {
        entities.country = c;
        break;
      }
    }

    const fields: Record<string, string> = {
      'computer science': 'Computer Science', 'cs': 'Computer Science',
      'engineering': 'Engineering', 'medicine': 'Medicine', 'mba': 'MBA',
      'business': 'Business', 'law': 'Law', 'arts': 'Arts',
      'data science': 'Data Science', 'ai': 'Artificial Intelligence',
      '人工智能': 'Artificial Intelligence', 'machine learning': 'Machine Learning',
    };
    for (const [key, val] of Object.entries(fields)) {
      if (lower.includes(key)) { entities.field = val; break; }
    }

    if (/phd|doctorate|doctoral/.test(lower)) entities.degreeLevel = 'PhD';
    else if (/master|msc|ma|meng/.test(lower)) entities.degreeLevel = 'Master';
    else if (/bachelor|bsc|ba|beng|undergrad/.test(lower)) entities.degreeLevel = 'Bachelor';
    else if (/diploma|certificate/.test(lower)) entities.degreeLevel = 'Diploma';

    const budgetMatch = lower.match(/(\d[\d,]*)\s*(?:budget|dollar|usd|\$)/);
    if (budgetMatch) entities.budget = parseInt(budgetMatch[1].replace(/,/g, ''));

    if (/pakistani|pakistan/.test(lower)) entities.nationality = 'Pakistani';
    else if (/indian|india/.test(lower)) entities.nationality = 'Indian';
    else if (/american|us\b/.test(lower)) entities.nationality = 'American';
    else if (/british|uk\b/.test(lower)) entities.nationality = 'British';

    return entities;
  }

  isMultiDomainQuery(message: string): boolean {
    const domains = this.classifyDomains(message);
    return domains.length > 1;
  }

  formatResultAsAIContext(result: OrchestrationResult): string {
    return responseBuilder.formatAsMessage(result);
  }
}

export const orchestratorService = new OrchestratorService();
