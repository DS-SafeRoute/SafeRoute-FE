import type { StatusBadgeColor } from '@components/chip/StatusBadge';

export interface BasicInfo {
  scenarioName: string;
  targetBuilding: string;
  scheduledAt: string;
  expectedParticipants: string;
}

export type FireConditionKey = 'origin' | 'spread' | 'smoke' | 'guideLight';

export interface FireConditionField {
  key: FireConditionKey;
  label: string;
  value: string;
}

export interface FireConditionOptions {
  origin: readonly string[];
  spread: readonly string[];
  smoke: readonly string[];
  guideLight: readonly string[];
}

export interface ScenarioDetail {
  basicInfo: BasicInfo;
  fireConditions: readonly FireConditionField[];
}

export interface PreviewMetric {
  id: string;
  label: string;
  value: string;
}

export interface PreviewStatus {
  label: string;
  color: StatusBadgeColor;
  dot?: boolean;
}
