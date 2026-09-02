import type { ScenarioResponse } from '@apis/__generated__/data-contracts';

import type { StatusBadgeColor } from '@components/chip/StatusBadge';

export type ScenarioStatus = NonNullable<ScenarioResponse['status']>;

export const SCENARIO_STATUS = {
  DRAFT: 'DRAFT',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
} as const satisfies Record<string, ScenarioStatus>;

type RequiredScenarioFields = Required<
  Pick<
    ScenarioResponse,
    | 'id'
    | 'name'
    | 'buildingId'
    | 'scheduledAt'
    | 'expectedParticipants'
    | 'status'
    | 'deletable'
    | 'fireSpreadSpeed'
  >
>;

export type Scenario = RequiredScenarioFields & {
  reportId: NonNullable<ScenarioResponse['reportId']> | null;
  targetEvacuationSec: NonNullable<ScenarioResponse['targetEvacuationSec']> | null;
};

export type ScenarioSummary = Omit<Scenario, 'fireSpreadSpeed' | 'targetEvacuationSec'>;

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
