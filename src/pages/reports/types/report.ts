export type ReportScoreColor = 'primary' | 'success';

export interface ReportScoreItem {
  label: string;
  weight: string;
  score: number;
  color: ReportScoreColor;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export type DensityLevel = 'high' | 'medium' | 'low';

export interface DensityItem {
  label: string;
  value: number;
  level: DensityLevel;
}

export interface RecommendationItem {
  level: DensityLevel;
  title: string;
  description: string;
}

export interface ReportNarrative {
  headlinePrefix: string;
  grade: string;
  headlineSuffix: string;
  strength: string;
  improvementPrefix: string;
  improvementScore: string;
  improvementSuffix: string;
}

export interface ReportSummary {
  grade: string;
  scoreText: string;
  percentileText: string;
  previousDelta: string;
  nationalDelta: string;
}
