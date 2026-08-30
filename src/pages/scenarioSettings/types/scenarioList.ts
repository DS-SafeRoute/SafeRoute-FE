import type { ScenarioStatus } from '@apis/scenarios/scenarioTypes';

import type { StatusBadgeColor } from '@components/chip/StatusBadge';

export const SCENARIO_STATUS_VIEW: Record<
  ScenarioStatus,
  { label: string; color: StatusBadgeColor }
> = {
  DRAFT: { label: '임시저장', color: 'purple' },
  READY: { label: '준비완료', color: 'green' },
  IN_PROGRESS: { label: '진행중', color: 'yellow' },
  COMPLETED: { label: '완료', color: 'neutral' },
  ERROR: { label: '훈련 실패', color: 'red' },
};
