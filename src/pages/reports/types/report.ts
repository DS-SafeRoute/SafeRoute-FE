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

export interface RecommendationItem {
  id: string;
  level: DensityLevel;
  title: string;
  description: string;
}

export interface ReportSummary {
  grade: string;
  scoreText: string;
}
