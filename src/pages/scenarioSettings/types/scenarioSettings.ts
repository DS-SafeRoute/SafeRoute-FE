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

export type FireConditionOptions = Record<FireConditionKey, readonly string[]>;

export interface PreviewMetric {
  id: string;
  label: string;
  value: string;
}
