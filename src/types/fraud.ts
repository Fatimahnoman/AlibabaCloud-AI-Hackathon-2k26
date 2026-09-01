export type FraudInputType = 'sms' | 'text' | 'url' | 'screenshot' | 'pdf' | 'image' | 'email';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type FraudReportStatus = 'pending' | 'analyzed' | 'reported' | 'dismissed';

export interface FraudReport {
  id: string;
  userId: string;
  inputType: FraudInputType;
  inputContent: string;
  inputFilePath?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  analysis?: FraudAnalysis;
  evidence?: FraudEvidence[];
  recommendation?: string;
  status: FraudReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FraudAnalysis {
  summary: string;
  indicators: FraudIndicator[];
  patterns: string[];
  confidence: number;
}

export interface FraudEvidence {
  type: string;
  description: string;
  severity: RiskLevel;
  confidence: number;
}

export interface FraudIndicator {
  id: string;
  indicatorType: string;
  indicatorValue: string;
  confidence: number;
  severity: RiskLevel;
  description?: string;
}

export interface FraudScanRequest {
  inputType: FraudInputType;
  content?: string;
  file?: File;
  url?: string;
}

export interface UrlScan {
  id: string;
  userId: string;
  url: string;
  domain: string;
  isHttps: boolean;
  hasRedirect: boolean;
  redirectUrl?: string;
  reputationScore?: number;
  riskLevel?: RiskLevel;
  analysis?: Record<string, unknown>;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CyberAuthority {
  id: string;
  name: string;
  country: string;
  type: 'government' | 'law_enforcement' | 'cyber_cell' | 'consumer_protection';
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  reportingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplaintProcedure {
  id: string;
  authorityId: string;
  country: string;
  category: string;
  procedureSteps?: Record<string, unknown>;
  requiredDocuments?: Record<string, unknown>;
  estimatedTime?: string;
  cost?: number;
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
