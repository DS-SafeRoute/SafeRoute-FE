import { SCENARIO_STATUS } from '../types/scenarioList';

import type { FireConditionField, FireConditionOptions } from '../types/scenarioSettings';

export const SCENARIO_STATUS_FILTER_OPTIONS = [
  { label: '전체 상태', value: 'ALL' },
  { label: '임시저장', value: SCENARIO_STATUS.DRAFT },
  { label: '준비완료', value: SCENARIO_STATUS.READY },
  { label: '진행중', value: SCENARIO_STATUS.IN_PROGRESS },
  { label: '완료', value: SCENARIO_STATUS.COMPLETED },
] as const;

export const FIRE_ORIGIN_OPTIONS = [
  '305호 · 동측 창가',
  '302호 · 중앙 복도',
  '301호 · 서측 출입문',
  '복도 천장 센서 구역',
] as const;

export const FIRE_SPREAD_OPTIONS = ['느림', '중간', '빠름'] as const;

export const DEFAULT_FIRE_CONDITIONS: FireConditionField[] = [
  { key: 'origin', label: '발화 위치', value: FIRE_ORIGIN_OPTIONS[0] },
  { key: 'spread', label: '확산 속도', value: FIRE_SPREAD_OPTIONS[1] },
];

export const FIRE_CONDITION_OPTIONS: FireConditionOptions = {
  origin: FIRE_ORIGIN_OPTIONS,
  spread: FIRE_SPREAD_OPTIONS,
};
