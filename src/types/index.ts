// src/types/index.ts
export type {
  User,
  Repository,
  Issue,
  Analysis,
  Feedback,
} from '@prisma/client';

export type DashboardIssue = {
  id: string;
  title: string;
  body?: string;
  author?: string;
  state: string;
  url: string;
  severity?: string;
  confidence?: number;
  hasAnalysis: boolean;
  analysisStatus?: string;
  createdAt: Date;
};

export type AnalysisDisplayData = {
  id: string;
  severity: string;
  confidence: number;
  rootCause: string;
  reproductionSteps: string;
  suggestedFix: string;
  codeDiff: string;
  prDescription: string;
  affectedFiles: string[];
  status: string;
  createdAt: Date;
};