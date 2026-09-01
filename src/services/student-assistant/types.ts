export interface UnifiedStudentProfile {
  userId: string;
  identity: {
    name: string;
    email: string;
    country?: string;
    preferredLanguage: string;
    educationLevel?: string;
  };
  learning: {
    subjects: string[];
    weakSubjects: string[];
    learningStyle?: string;
    studyHoursPerDay?: number;
    targetExam?: string;
    activePlanCount: number;
    totalStudyMinutesThisWeek: number;
    topicsTracked: number;
    avgMasteryLevel: number;
  };
  education: {
    savedCourses: number;
    savedUniversities: number;
    savedScholarships: number;
    applicationChecklists: { title: string; status: string; progress: number }[];
    targetCountry?: string;
    targetField?: string;
  };
  finances: {
    hasProfile: boolean;
    monthlyIncome?: number;
    currency?: string;
    savingsGoal?: number;
    activeSavingsGoals: number;
    totalSaved: number;
    savingsProgress: number;
  };
  security: {
    totalScans: number;
    recentRiskLevel?: string;
    unresolvedReports: number;
  };
  memory: Record<string, string>;
}

export type PrivacyLevel = 'public' | 'education' | 'financial' | 'sensitive';

export interface PrivacyRule {
  domain: string;
  level: PrivacyLevel;
  injectAlways: boolean;
  requiresExplicitMention: boolean;
  description: string;
}

export interface ProactiveInsight {
  id: string;
  type: 'reminder' | 'suggestion' | 'warning' | 'celebration' | 'nudge';
  domain: 'education' | 'budget' | 'study' | 'career' | 'security' | 'application';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export interface AssistantContext {
  profile: UnifiedStudentProfile;
  insights: ProactiveInsight[];
  contextString: string;
  privacyFilteredContext: string;
  injectedDomains: string[];
}

export interface StudentProfileSummary {
  name: string;
  educationLevel?: string;
  targetCountry?: string;
  targetField?: string;
  weakSubjects: string[];
  preferredLanguage: string;
}

export interface StudyProgressSummary {
  weeklyHours: number;
  topicsTracked: number;
  activePlans: number;
  sessionsThisWeek: number;
}

export interface EducationGoalsSummary {
  savedCourses: number;
  savedUniversities: number;
  savedScholarships: number;
  activeChecklists: number;
}

export interface FinancialSummary {
  monthlyIncome: number;
  currency: string;
  savingsGoals: {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
  }[];
}

export interface SecuritySummary {
  totalScans: number;
  fraudReports: number;
  highestRiskLevel: string;
}

export interface ApplicationProgress {
  id: string;
  title: string;
  status: string;
  progress: number;
  items: { label: string; completed: boolean }[];
}

export interface WeakSubjectInfo {
  subject: string;
  averageMastery: number;
  topicCount: number;
}

export interface WeeklyStudySummary {
  totalHours: number;
  totalSessions: number;
  subjectsStudied: string[];
}

export interface StudentDashboardSummary {
  profile: StudentProfileSummary;
  studyProgress: StudyProgressSummary;
  educationGoals: EducationGoalsSummary;
  financial: FinancialSummary;
  security: SecuritySummary;
  insights: ProactiveInsight[];
  applications: ApplicationProgress[];
  weakSubjects: WeakSubjectInfo[];
  weeklyStudySummary: WeeklyStudySummary;
}
