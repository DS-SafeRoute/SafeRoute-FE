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

export type RecommendationLevel = 'high' | 'medium' | 'low';

export interface RecommendationItem {
  id: string;
  level: RecommendationLevel;
  title: string;
  description: string;
}

export interface ReportSummary {
  grade: string;
  scoreText: string;
}

export interface ReportMetaItem {
  label: string;
  value: string;
}
