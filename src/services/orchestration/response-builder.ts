import type { OrchestrationResult, OrchestrationQuery, EducationPath, BudgetEstimate, DocumentChecklist, RoadmapStep } from './types';

export class ResponseBuilder {
  buildResponse(
    query: OrchestrationQuery,
    educationPath: EducationPath,
    userBudget?: { monthlyIncome?: number; savingsGoal?: number }
  ): OrchestrationResult {
    const budgetEstimate = this.estimateBudget(query, educationPath, userBudget);
    const documents = this.buildDocumentChecklist(query);
    const roadmap = this.buildRoadmap(query);
    const nextActions = this.determineNextActions(educationPath, budgetEstimate, documents);
    const sources = this.collectSources(educationPath);

    return {
      query,
      educationPath,
      budgetEstimate,
      documents,
      roadmap,
      nextActions,
      confidence: this.calculateConfidence(educationPath),
      sources,
      generatedAt: new Date(),
    };
  }

  private estimateBudget(
    query: OrchestrationQuery,
    educationPath: EducationPath,
    userBudget?: { monthlyIncome?: number; savingsGoal?: number }
  ): BudgetEstimate {
    const country = query.entities.country?.toLowerCase() || '';
    const tuitionRanges: Record<string, { min: number; max: number }> = {
      germany: { min: 0, max: 3000 },
      usa: { min: 20000, max: 60000 },
      uk: { min: 15000, max: 40000 },
      canada: { min: 15000, max: 35000 },
      australia: { min: 20000, max: 45000 },
      pakistan: { min: 500, max: 5000 },
    };
    const livingCostRanges: Record<string, { min: number; max: number }> = {
      germany: { min: 800, max: 1200 },
      usa: { min: 1000, max: 2500 },
      uk: { min: 1000, max: 2000 },
      canada: { min: 800, max: 1500 },
      australia: { min: 1000, max: 2000 },
      pakistan: { min: 300, max: 800 },
    };

    const key = Object.keys(tuitionRanges).find(k => country.includes(k)) || 'usa';
    const tuition = tuitionRanges[key];
    const living = livingCostRanges[key];
    const tuitionRange = { min: tuition.min, max: tuition.max };
    const livingCostRange = { min: living.min * 12, max: living.max * 12 };
    const totalEstimate = { min: tuitionRange.min + livingCostRange.min, max: tuitionRange.max + livingCostRange.max };

    const hasStrongScholarships = educationPath.scholarships.some(s => s.matchStrength === 'strong');
    const scholarshipSavings = hasStrongScholarships ? Math.round(totalEstimate.max * 0.5) : 0;
    const netEstimate = {
      min: Math.max(0, totalEstimate.min - scholarshipSavings),
      max: Math.max(0, totalEstimate.max - scholarshipSavings),
    };

    return {
      currency: 'USD',
      tuitionRange,
      livingCostRange,
      totalEstimate,
      scholarshipSavings,
      netEstimate,
      userBudget: userBudget?.monthlyIncome ? userBudget.monthlyIncome * 12 : undefined,
      isAffordable: userBudget?.monthlyIncome ? netEstimate.max <= userBudget.monthlyIncome * 12 : undefined,
    };
  }

  private buildDocumentChecklist(_query: OrchestrationQuery): DocumentChecklist {
    const items = [
      { item: 'Valid Passport (6+ months validity)', priority: 'essential' as const, status: 'pending' as const },
      { item: 'Academic Transcripts', priority: 'essential' as const, status: 'pending' as const },
      { item: 'English Proficiency Test (IELTS/TOEFL)', priority: 'essential' as const, status: 'pending' as const },
      { item: 'Statement of Purpose', priority: 'essential' as const, status: 'pending' as const },
      { item: 'Letters of Recommendation (2-3)', priority: 'recommended' as const, status: 'pending' as const },
      { item: 'CV/Resume', priority: 'recommended' as const, status: 'pending' as const },
      { item: 'Financial Proof (bank statements)', priority: 'essential' as const, status: 'pending' as const },
      { item: 'Scholarship Application Documents', priority: 'recommended' as const, status: 'pending' as const },
      { item: 'Portfolio (if applicable)', priority: 'optional' as const, status: 'pending' as const },
      { item: 'Health Insurance', priority: 'recommended' as const, status: 'pending' as const },
    ];

    return { category: 'Study Abroad Application', items };
  }

  private buildRoadmap(_query: OrchestrationQuery): RoadmapStep[] {
    return [
      { phase: 1, title: 'Research & Shortlisting', timeframe: 'Month 1-2', tasks: ['Research universities and programs', 'Check scholarship eligibility', 'Review admission requirements', 'Shortlist 3-5 target universities'], verified: false },
      { phase: 2, title: 'Test Preparation', timeframe: 'Month 2-4', tasks: ['Prepare for IELTS/TOEFL/GRE', 'Take language proficiency tests', 'Achieve target scores'], verified: false },
      { phase: 3, title: 'Document Preparation', timeframe: 'Month 3-5', tasks: ['Write statement of purpose', 'Request recommendation letters', 'Prepare CV and transcripts', 'Gather financial documents'], verified: false },
      { phase: 4, title: 'Applications', timeframe: 'Month 4-7', tasks: ['Submit university applications', 'Apply for scholarships', 'Track application status'], verified: false },
      { phase: 5, title: 'Acceptance & Visa', timeframe: 'Month 7-9', tasks: ['Accept university offer', 'Apply for student visa', 'Arrange health insurance', 'Book accommodation'], verified: false },
      { phase: 6, title: 'Pre-Departure', timeframe: 'Month 9-10', tasks: ['Book flights', 'Arrange finances', 'Attend pre-departure orientation', 'Pack essentials'], verified: false },
    ];
  }

  private determineNextActions(
    educationPath: EducationPath,
    budget: BudgetEstimate,
    documents: DocumentChecklist
  ) {
    const actions: { action: string; priority: 'high' | 'medium' | 'low'; domain: 'education' | 'budget' | 'scholarship' | 'career' }[] = [];

    if (educationPath.courses.length === 0) {
      actions.push({ action: 'Search for specific courses matching your field', priority: 'high', domain: 'education' });
    }
    if (educationPath.universities.length === 0) {
      actions.push({ action: 'Explore universities in your target country', priority: 'high', domain: 'education' });
    }
    if (educationPath.scholarships.length === 0) {
      actions.push({ action: 'Search for scholarships matching your profile', priority: 'high', domain: 'scholarship' });
    }
    if (budget.scholarshipSavings === 0) {
      actions.push({ action: 'Apply for scholarships to reduce costs', priority: 'medium', domain: 'scholarship' });
    }
    if (documents.items.some(i => i.priority === 'essential')) {
      actions.push({ action: 'Start preparing essential documents', priority: 'high', domain: 'education' });
    }

    return actions.slice(0, 5);
  }

  private collectSources(educationPath: EducationPath) {
    const sources: { url: string; name: string; verified: boolean }[] = [];
    educationPath.universities.forEach(u => {
      sources.push({ url: '', name: u.name, verified: u.verificationStatus === 'verified' });
    });
    educationPath.scholarships.forEach(s => {
      sources.push({ url: '', name: s.name, verified: s.verificationStatus === 'verified' });
    });
    return sources;
  }

  private calculateConfidence(educationPath: EducationPath): number {
    let score = 0;
    if (educationPath.courses.length > 0) score += 25;
    if (educationPath.universities.length > 0) score += 25;
    if (educationPath.scholarships.length > 0) score += 25;
    if (educationPath.careerPaths.length > 0) score += 25;
    return score;
  }

  formatAsMessage(result: OrchestrationResult): string {
    const lines: string[] = [];
    lines.push('## Your Personalized Education Plan\n');

    lines.push(`### Target: ${result.educationPath.degreeLevel} in ${result.educationPath.field}`);
    lines.push(`**Country:** ${result.educationPath.country}\n`);

    if (result.educationPath.courses.length > 0) {
      lines.push('### Matching Courses');
      result.educationPath.courses.slice(0, 5).forEach(c => {
        lines.push(`- **${c.name}** at ${c.university} (${c.universityCountry})`);
      });
      lines.push('');
    }

    if (result.educationPath.universities.length > 0) {
      lines.push('### University Shortlist (Verified)');
      result.educationPath.universities.slice(0, 5).forEach(u => {
        const rank = u.rankings.length > 0 ? ` [Rank: #${u.rankings[0].position}]` : '';
        const verified = u.verificationStatus === 'verified' ? ' [Verified]' : '';
        lines.push(`- **${u.name}** (${u.country})${rank}${verified}`);
      });
      lines.push('');
    }

    if (result.educationPath.scholarships.length > 0) {
      lines.push('### Scholarship Matches');
      result.educationPath.scholarships.filter(s => s.matchStrength !== 'not_eligible').forEach(s => {
        const amount = s.amount ? ` - ${s.amount}` : '';
        const strength = s.matchStrength === 'strong' ? 'Strong' : 'Possible';
        lines.push(`- **${s.name}** (${s.provider})${amount} - ${strength}`);
      });
      lines.push('');
    }

    lines.push('### Estimated Budget');
    const b = result.budgetEstimate;
    lines.push(`- Tuition: $${b.tuitionRange?.min.toLocaleString()} - $${b.tuitionRange?.max.toLocaleString()}/year`);
    lines.push(`- Living: $${b.livingCostRange?.min.toLocaleString()} - $${b.livingCostRange?.max.toLocaleString()}/year`);
    if (b.scholarshipSavings && b.scholarshipSavings > 0) {
      lines.push(`- Scholarship Savings: -$${b.scholarshipSavings.toLocaleString()}`);
    }
    lines.push(`- **Total: $${b.netEstimate?.min.toLocaleString()} - $${b.netEstimate?.max.toLocaleString()}/year**`);
    lines.push('');

    if (result.documents.items.length > 0) {
      lines.push('### Documents Checklist');
      result.documents.items.forEach(d => {
        const marker = d.priority === 'essential' ? '[Required]' : d.priority === 'recommended' ? '[Recommended]' : '[Optional]';
        lines.push(`- ${marker} ${d.item}`);
      });
      lines.push('');
    }

    lines.push('### Roadmap');
    result.roadmap.forEach(r => {
      lines.push(`**Phase ${r.phase}: ${r.title}** (${r.timeframe})`);
      r.tasks.forEach(t => lines.push(`  - ${t}`));
    });
    lines.push('');

    if (result.nextActions.length > 0) {
      lines.push('### Next Actions');
      result.nextActions.forEach(a => {
        const marker = a.priority === 'high' ? '[High]' : a.priority === 'medium' ? '[Medium]' : '[Low]';
        lines.push(`- ${marker} ${a.action}`);
      });
    }

    return lines.join('\n');
  }
}

export const responseBuilder = new ResponseBuilder();
