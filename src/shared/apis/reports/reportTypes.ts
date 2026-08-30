export interface GenerateTrainingReportRequest {
  participantCount: number;
  survivorCount: number;
}

export interface GenerateTrainingReportVariables {
  sessionId: string;
  body: GenerateTrainingReportRequest;
}

export interface TrainingReportRecommendation {
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  title?: string;
  description?: string;
}

export interface CumulativeEvacuationPoint {
  elapsedSec?: number;
  cumulativeCount?: number;
}

export interface RecentEvacuationTime {
  ordinal?: number;
  evacuationSec?: number;
}

export interface TrainingReportResponse {
  reportId?: string;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  overallScore?: number;
  avgEvacuationSec?: number;
  evacuationScore?: number;
  participantCount?: number;
  survivorCount?: number;
  survivalRate?: number;
  bottleneckCount?: number;
  bottleneckScore?: number;
  deviationRate?: number;
  deviationScore?: number;
  riskIndex?: number;
  summaryText?: string;
  recommendations?: TrainingReportRecommendation[];
  pdfUrl?: string;
  charts?: {
    cumulativeEvacuation?: CumulativeEvacuationPoint[];
    recentEvacuationTimes?: RecentEvacuationTime[];
  };
}
