export interface LearningProfile {
  id: string;
  userId: string;
  educationLevel?: string;
  subjects?: string[];
  weakSubjects?: string[];
  learningStyle?: string;
  studyHoursPerDay?: number;
  targetExam?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyPlan {
  id: string;
  userId: string;
  learningProfileId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused';
  schedule?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  subjects?: string[];
  qualifications?: string;
  experience?: string;
  hourlyRate?: number;
  currency?: string;
  rating?: number;
  totalStudents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  learningProfileId: string;
  grade?: string;
  school?: string;
  weakSubjects?: string[];
  goals?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  topic?: string;
  durationMin: number;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  rating?: number;
  createdAt: Date;
}

export interface StudyTopic {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  masteryLevel: number;
  priority: 'low' | 'medium' | 'high';
  lastStudiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySchedule {
  id: string;
  userId: string;
  planId?: string;
  date: Date;
  subject: string;
  startTime: string;
  endTime: string;
  activity: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherLessonPlan {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  grade: string;
  durationMin: number;
  content: string;
  objectives?: string;
  materials?: string;
  assessment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherAssessment {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  content: string;
  answerKey?: string;
  createdAt: Date;
}

export interface TeacherHomework {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  grade: string;
  title: string;
  description: string;
  dueDays: number;
  createdAt: Date;
}

export interface TeacherRubric {
  id: string;
  userId: string;
  title: string;
  subject: string;
  assessmentType: string;
  criteria: string;
  totalPoints: number;
  createdAt: Date;
}

export interface PracticeQuiz {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  title: string;
  totalMarks: number;
  scoredMarks: number;
  percentage: number;
  timeTakenMin?: number;
  questions?: QuizQuestion[];
  notes?: string;
  studiedAt: Date;
  createdAt: Date;
}

export interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer?: string;
  userAnswer?: string;
  isCorrect?: boolean;
  marks?: number;
}

export interface PerformanceMetric {
  id: string;
  userId: string;
  subject: string;
  topic?: string;
  metricType: PerformanceMetricType;
  value: number;
  metadata?: Record<string, unknown>;
  recordedAt: Date;
  createdAt: Date;
}

export type PerformanceMetricType = 'study_hours' | 'mastery_change' | 'quiz_score' | 'revision_count' | 'session_rating' | 'focus_score';

export interface RevisionPlan {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  masteryAtCreation: number;
  revisionCount: number;
  nextRevision?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectPerformance {
  subject: string;
  totalSessions: number;
  totalMinutes: number;
  averageRating: number;
  averageQuizScore: number;
  masteryDistribution: { level: string; count: number }[];
  trend: 'improving' | 'declining' | 'stable';
  trendPercentage: number;
  topics: TopicPerformance[];
}

export interface TopicPerformance {
  topic: string;
  masteryLevel: number;
  sessionsCount: number;
  averageQuizScore: number;
  lastStudiedAt?: Date;
  needsRevision: boolean;
  diagnostic: string;
}

export interface PerformanceDiagnostic {
  overallScore: number;
  summary: string;
  strengths: { subject: string; detail: string }[];
  weaknesses: { subject: string; topic: string; detail: string; recommendation: string }[];
  revisionUrgency: { subject: string; topic: string; daysSinceStudied: number; recommendation: string }[];
  studyPatternInsights: string[];
  weeklyTrend: 'improving' | 'declining' | 'stable';
}

export interface PerformanceOverview {
  subjects: SubjectPerformance[];
  diagnostic: PerformanceDiagnostic;
  totalStudyMinutes: number;
  totalQuizzes: number;
  averageQuizScore: number;
  activeRevisionPlans: number;
  overdueRevisions: number;
}

export interface Classroom {
  id: string;
  teacherId: string;
  name: string;
  subject: string;
  grade?: string;
  description?: string;
  inviteCode: string;
  isActive: boolean;
  enrolledStudents: number;
  resourceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassroomEnrollment {
  id: string;
  classroomId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  updatedAt: Date;
}

export interface ClassroomResource {
  id: string;
  classroomId: string;
  title: string;
  description?: string;
  resourceType: ResourceType;
  url?: string;
  content?: Record<string, unknown>;
  uploadedBy: string;
  createdAt: Date;
}

export type ResourceType = 'lesson_plan' | 'assignment' | 'quiz' | 'rubric' | 'document' | 'video' | 'link' | 'other';

export interface ClassroomWithStats extends Classroom {
  enrollments: ClassroomEnrollment[];
  resources: ClassroomResource[];
}

export interface StudentDataAccess {
  studentId: string;
  studentName: string;
  studyTopics: { subject: string; topic: string; masteryLevel: number }[];
  recentQuizzes: { subject: string; topic: string; score: number; date: Date }[];
  overallMastery: number;
  totalStudyMinutes: number;
}

export interface TeacherWorkspaceDashboard {
  totalClassrooms: number;
  activeClassrooms: number;
  totalStudents: number;
  totalResources: number;
  recentClassrooms: Classroom[];
}

// ============================================
// PHASE 15: NOTIFICATION & DEADLINE ENGINE
// ============================================

export type DeadlineType = 'scholarship' | 'university' | 'application' | 'study' | 'budget';

export type DeadlineStatus = 'upcoming' | 'urgent' | 'passed' | 'completed';

export type NotificationType = 'deadline_approaching' | 'deadline_today' | 'deadline_passed' | 'budget_goal' | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Deadline {
  id: string;
  userId: string;
  title: string;
  description?: string;
  deadlineDate: Date;
  deadlineType: DeadlineType;
  sourceType?: string;
  sourceId?: string;
  isVerified: boolean;
  lastVerifiedAt?: Date;
  status: DeadlineStatus;
  reminderDaysBefore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  deadlineId?: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date;
  metadataJson?: string;
  createdAt: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  scholarshipAlerts: boolean;
  universityAlerts: boolean;
  applicationAlerts: boolean;
  studyAlerts: boolean;
  budgetAlerts: boolean;
  reminderDaysBefore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeadlineInput {
  title: string;
  description?: string;
  deadlineDate: Date;
  deadlineType: DeadlineType;
  sourceType?: string;
  sourceId?: string;
  isVerified?: boolean;
  reminderDaysBefore?: number;
}

export interface UpdateDeadlineInput {
  title?: string;
  description?: string;
  deadlineDate?: Date;
  status?: DeadlineStatus;
  reminderDaysBefore?: number;
}

export interface NotificationWithDeadline extends Notification {
  deadline?: Deadline;
}

export interface DeadlineNotificationResult {
  deadlineId: string;
  title: string;
  deadlineDate: Date;
  daysUntil: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationDashboard {
  unreadCount: number;
  upcomingDeadlines: DeadlineNotificationResult[];
  recentNotifications: Notification[];
  stats: {
    totalDeadlines: number;
    upcoming: number;
    urgent: number;
    passed: number;
    completed: number;
  };
}

// ============================================
// PHASE 16: MULTI-COUNTRY EDUCATION INTELLIGENCE
// ============================================

export interface CountryProfile {
  id: string;
  name: string;
  code: string;
  region?: string;
  capital?: string;
  currency: string;
  language: string;
  educationSystem?: string;
  timezone?: string;
  costOfLivingIndex?: number;
  qualityOfLifeIndex?: number;
  safetyIndex?: number;
  popularForStudents: boolean;
  profileImageUrl?: string;
  overview?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CountryEducationAuthority {
  id: string;
  countryId: string;
  name: string;
  acronym?: string;
  type: string;
  description?: string;
  websiteUrl?: string;
  isVerified: boolean;
  lastVerifiedAt?: Date;
  createdAt: Date;
}

export interface CountryVisaSource {
  id: string;
  countryId: string;
  sourceName: string;
  sourceUrl?: string;
  visaType: string;
  description?: string;
  processingTime?: string;
  requirements?: string;
  isVerified: boolean;
  lastVerifiedAt?: Date;
  createdAt: Date;
}

export interface CountryReportingAuthority {
  id: string;
  countryId: string;
  name: string;
  type: string;
  description?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  isVerified: boolean;
  lastVerifiedAt?: Date;
  createdAt: Date;
}

export interface CountryCostInfo {
  id: string;
  countryId: string;
  category: string;
  subcategory?: string;
  averageCost: number;
  currency: string;
  period?: string;
  sourceName?: string;
  sourceUrl?: string;
  isVerified: boolean;
  lastVerifiedAt?: Date;
  year?: number;
  createdAt: Date;
}

export interface CountryScholarship {
  id: string;
  countryId: string;
  name: string;
  provider: string;
  type: string;
  amount?: string;
  currency?: string;
  coverage?: string;
  eligibility?: string;
  deadline?: Date;
  applicationUrl?: string;
  description?: string;
  isVerified: boolean;
  lastVerifiedAt?: Date;
  createdAt: Date;
}

export interface CountryAdmissionRequirement {
  id: string;
  countryId: string;
  level: string;
  requirementType: string;
  description: string;
  details?: string;
  isVerified: boolean;
  lastVerifiedAt?: Date;
  createdAt: Date;
}

export interface CountryDetail extends CountryProfile {
  authorities: CountryEducationAuthority[];
  visaSources: CountryVisaSource[];
  reportingBodies: CountryReportingAuthority[];
  costInfo: CountryCostInfo[];
  scholarships: CountryScholarship[];
  admissionReqs: CountryAdmissionRequirement[];
}

export interface CountrySummary {
  id: string;
  name: string;
  code: string;
  region?: string;
  currency: string;
  language: string;
  popularForStudents: boolean;
  costOfLivingIndex?: number;
  universityCount: number;
  scholarshipCount: number;
}

export interface CountryComparison {
  countries: {
    name: string;
    code: string;
    currency: string;
    costOfLivingIndex?: number;
    safetyIndex?: number;
    qualityOfLifeIndex?: number;
    averageTuition?: number;
    averageLivingCost?: number;
  }[];
}

// ============================================
// PHASE 17: FINANCIAL EDUCATION INTELLIGENCE
// ============================================

export type CostVerificationStatus = 'verified' | 'estimated' | 'user_provided';

export type CostCategory = 'tuition' | 'application' | 'testing' | 'visa' | 'travel' | 'accommodation' | 'living' | 'insurance' | 'emergency' | 'other';

export type CostPlanStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface EducationCostPlan {
  id: string;
  userId: string;
  title: string;
  countryId?: string;
  targetCountry?: string;
  targetUniversity?: string;
  studyLevel?: string;
  studyField?: string;
  startDate?: Date;
  status: CostPlanStatus;
  notes?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EducationCostItem {
  id: string;
  planId: string;
  category: CostCategory;
  label: string;
  description?: string;
  amount: number;
  currency: string;
  verificationStatus: CostVerificationStatus;
  sourceType?: string;
  sourceUrl?: string;
  isRequired: boolean;
  quantity: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCostPlanInput {
  title: string;
  countryId?: string;
  targetCountry?: string;
  targetUniversity?: string;
  studyLevel?: string;
  studyField?: string;
  startDate?: Date;
  currency?: string;
  notes?: string;
}

export interface CreateCostItemInput {
  category: CostCategory;
  label: string;
  description?: string;
  amount: number;
  currency?: string;
  verificationStatus: CostVerificationStatus;
  sourceType?: string;
  sourceUrl?: string;
  isRequired?: boolean;
  quantity?: number;
  notes?: string;
}

export interface CostPlanWithItems extends EducationCostPlan {
  items: EducationCostItem[];
}

export interface CostBreakdown {
  category: CostCategory;
  label: string;
  totalAmount: number;
  items: EducationCostItem[];
}

export interface CostSummary {
  planId: string;
  title: string;
  currency: string;
  totalCost: number;
  verifiedTotal: number;
  estimatedTotal: number;
  userProvidedTotal: number;
  breakdownByCategory: CostBreakdown[];
  itemCount: number;
  requiredItemCount: number;
  optionalItemCount: number;
}

export interface AutoPopulateResult {
  itemsCreated: number;
  categories: CostCategory[];
  totalEstimated: number;
  warnings: string[];
}

export interface CostComparisonResult {
  plans: {
    planId: string;
    title: string;
    targetCountry: string;
    totalCost: number;
    currency: string;
  }[];
}
