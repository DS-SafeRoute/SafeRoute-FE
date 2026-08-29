import type { StatusBadgeColor } from '@components/chip/StatusBadge';

export const SCENARIO_STATUS = {
  DRAFT: 'DRAFT',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
} as const;

export type ScenarioStatus = (typeof SCENARIO_STATUS)[keyof typeof SCENARIO_STATUS];

export interface ScenarioSummary {
  id: string;
  name: string;
  buildingId: string;
  scheduledAt: string;
  expectedParticipants: number;
  status: ScenarioStatus;
  deletable: boolean;
  reportId: string | null;
}

export interface Scenario extends ScenarioSummary {
  fireSpreadSpeed: 'SLOW' | 'MEDIUM' | 'FAST';
  startNodeId: string | null;
}

export const SCENARIO_STATUS_VIEW: Record<
  ScenarioStatus,
  { label: string; color: StatusBadgeColor }
> = {
  DRAFT: { label: '임시저장', color: 'purple' },
  READY: { label: '준비완료', color: 'green' },
  IN_PROGRESS: { label: '진행중', color: 'yellow' },
  COMPLETED: { label: '완료', color: 'neutral' },
  ERROR: { label: '오류', color: 'red' },
};
