export type DocumentStatus = 'processing' | 'completed' | 'failed' | 'deleted';

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface DocumentScan {
  id: string;
  documentId: string;
  extractedText?: string;
  scanResult?: Record<string, unknown>;
  riskScore?: number;
  createdAt: Date;
}

export interface DocumentUploadRequest {
  file: File;
  purpose?: 'analysis' | 'fraud_check' | 'education' | 'budget';
}

export interface DocumentAnalysis {
  documentId: string;
  summary: string;
  keyPoints: string[];
  extractedData?: Record<string, unknown>;
  riskIndicators?: string[];
}

export type AnalysisDocumentType = 'sop' | 'personal_statement' | 'recommendation_letter' | 'cv_resume' | 'cover_letter' | 'essay' | 'other';

export interface ScoreBreakdown {
  overall: number;
  structure: number;
  clarity: number;
  grammar: number;
  relevance: number;
}

export interface DocumentSuggestion {
  id: string;
  category: 'structure' | 'clarity' | 'grammar' | 'content' | 'style' | 'impact';
  severity: 'critical' | 'major' | 'minor';
  originalText?: string;
  suggestedText?: string;
  explanation: string;
}

export interface IntegrityCheckResult {
  flaggedClaims: { claim: string; reason: string; suggestion: string }[];
  fakeIndicators: { type: string; description: string }[];
  overallIntegrityScore: number;
  warnings: string[];
}

export interface DocumentAnalysisResponse {
  id: string;
  documentType: AnalysisDocumentType;
  fileName: string;
  originalContent: string;
  language?: string;
  wordCount: number;
  scores: ScoreBreakdown;
  suggestions: DocumentSuggestion[];
  integrity: IntegrityCheckResult;
  executiveSummary: string;
  strengths: string[];
  improvements: string[];
  processingTimeMs: number;
  createdAt: Date;
}

export interface DocumentAnalysisRequest {
  content?: string;
  documentType: AnalysisDocumentType;
  targetInstitution?: string;
  targetProgram?: string;
  additionalContext?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  documentType: AnalysisDocumentType;
  fileName: string;
  overallScore: number;
  wordCount: number;
  createdAt: Date;
}
