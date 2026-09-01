export type SourceEntityType = 'university' | 'scholarship' | 'country' | 'fraud_report' | 'cyber_authority' | 'course' | 'visa_information' | 'complaint_procedure' | 'career_path' | 'university_ranking';
export type SourceType = 'official_government' | 'official_university' | 'official_scholarship' | 'official_bank' | 'official_cyber_authority' | 'official_organization' | 'other';
export type VerificationStatus = 'verified' | 'needs_review' | 'unverified' | 'expired' | 'pending';

export interface Source {
  id: string;
  entityType: SourceEntityType;
  entityId: string;
  sourceUrl: string;
  sourceName?: string;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: Date;
  nextCheckAt?: Date;
  contentHash?: string;
  confidenceScore: number;
  checkCount: number;
  failureCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationLog {
  id: string;
  sourceId: string;
  entityType: string;
  entityId: string;
  previousStatus?: string;
  newStatus: string;
  method: string;
  result?: string;
  httpStatus?: number;
  contentChanged: boolean;
  details?: string;
  checkedBy?: string;
  durationMs?: number;
  createdAt: Date;
}

export interface SourceSnapshot {
  id: string;
  sourceId: string;
  contentHash: string;
  httpStatus?: number;
  contentPreview?: string;
  headers?: string;
  capturedAt: Date;
}
