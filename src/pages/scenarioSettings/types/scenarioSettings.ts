import type { StatusBadgeColor } from '@components/chip/StatusBadge';

export interface BasicInfo {
  scenarioName: string;
  targetBuilding: string;
  scheduledAt: string;
  expectedParticipants: string;
  startNodeId: string;
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
