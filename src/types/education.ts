export type DegreeType = 'bachelors' | 'masters' | 'phd' | 'diploma' | 'certificate';
export type UniversityType = 'public' | 'private';
import type { VerificationStatus } from './source';
export type { VerificationStatus };

export interface University {
  id: string;
  name: string;
  country: string;
  city?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  ranking?: number;
  foundedYear?: number;
  type: UniversityType;
  sourceUrl?: string;
  sourceName?: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  universityId: string;
  name: string;
  degree: DegreeType;
  duration?: string;
  language?: string;
  tuitionFee?: number;
  currency?: string;
  description?: string;
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  country: string;
  amount?: number;
  currency?: string;
  deadline?: Date;
  description?: string;
  eligibilityCriteria?: Record<string, unknown>;
  sourceUrl?: string;
  sourceName?: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  continent?: string;
  visaRequired?: boolean;
  costOfLiving?: number;
  safetyIndex?: number;
  educationSystem?: string;
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdmissionRequirement {
  id: string;
  universityId: string;
  courseId?: string;
  countryId: string;
  requirementType: string;
  requirementValue: string;
  deadline?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisaInformation {
  id: string;
  countryId: string;
  visaType: string;
  requirements?: Record<string, unknown>;
  processingTime?: string;
  fee?: number;
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UniversitySearchFilters {
  country?: string;
  type?: UniversityType;
  degree?: DegreeType;
  minRanking?: number;
  maxRanking?: number;
  maxTuition?: number;
  currency?: string;
  language?: string;
}

export interface ScholarshipSearchFilters {
  country?: string;
  provider?: string;
  minAmount?: number;
  maxAmount?: number;
  deadline?: Date;
  degreeLevel?: DegreeType;
}

export type ApplicationStatus = 'researching' | 'preparing' | 'documents_ready' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted' | 'deferred' | 'withdrawn';
export type ApplicationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ApplicationEntityType = 'university' | 'scholarship' | 'course';

export interface ApplicationWorkspace {
  id: string;
  userId: string;
  entityType: ApplicationEntityType;
  entityId?: string;
  title: string;
  programName?: string;
  institutionName?: string;
  country?: string;
  deadline?: Date;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  notes?: string;
  officialUrl?: string;
  documents: ApplicationDocument[];
  requirements: ApplicationRequirement[];
  checklistItems: ApplicationChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationChecklistItem {
  id: string;
  workspaceId: string;
  label: string;
  isCompleted: boolean;
  dueDate?: Date;
  category?: string;
  notes?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationDocument {
  name: string;
  status: 'pending' | 'ready' | 'uploaded';
  notes?: string;
}

export interface ApplicationRequirement {
  type: string;
  description: string;
  mandatory: boolean;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface WorkspaceSummary {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  upcomingDeadlines: { id: string; title: string; deadline: Date; daysLeft: number }[];
  overallProgress: number;
}
