export type OrchestrationDomain = 'education' | 'budget' | 'scholarship' | 'career' | 'fraud' | 'study' | 'teacher' | 'general';

export interface OrchestrationQuery {
  userId: string;
  message: string;
  domains: OrchestrationDomain[];
  entities: {
    country?: string;
    field?: string;
    degreeLevel?: string;
    budget?: number;
    deadline?: string;
    nationality?: string;
  };
}

export interface EducationPath {
  field: string;
  degreeLevel: string;
  country: string;
  courses: {
    id: string;
    name: string;
    university: string;
    universityCountry: string;
    degree: string;
    careerPaths: string[];
  }[];
  universities: {
    id: string;
    name: string;
    country: string;
    type: string;
    rankings: { provider: string; position: number }[];
    verificationStatus: string;
  }[];
  scholarships: {
    id: string;
    name: string;
    provider: string;
    amount?: string;
    deadline?: Date;
    degreeLevel: string;
    matchStrength: 'strong' | 'possible' | 'not_eligible';
    verificationStatus: string;
  }[];
  careerPaths: {
    title: string;
    field: string;
    skills: string[];
    entryRoles: string[];
  }[];
}

export interface BudgetEstimate {
  currency: string;
  tuitionRange?: { min: number; max: number };
  livingCostRange?: { min: number; max: number };
  totalEstimate?: { min: number; max: number };
  scholarshipSavings?: number;
  netEstimate?: { min: number; max: number };
  userBudget?: number;
  isAffordable?: boolean;
}

export interface DocumentChecklist {
  category: string;
  items: { item: string; priority: 'essential' | 'recommended' | 'optional'; status: 'pending' }[];
}

export interface RoadmapStep {
  phase: number;
  title: string;
  timeframe: string;
  tasks: string[];
  verified: boolean;
}

export interface OrchestrationResult {
  query: OrchestrationQuery;
  educationPath: EducationPath;
  budgetEstimate: BudgetEstimate;
  documents: DocumentChecklist;
  roadmap: RoadmapStep[];
  nextActions: { action: string; priority: 'high' | 'medium' | 'low'; domain: OrchestrationDomain }[];
  confidence: number;
  sources: { url: string; name: string; verified: boolean }[];
  generatedAt: Date;
}
