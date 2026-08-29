import { SCENARIO_STATUS } from '@pages/scenarioSettings/types/scenarioList';
import type {
  FireConditionField,
  FireConditionOptions,
} from '@pages/scenarioSettings/types/scenarioSettings';

export const SCENARIO_STATUS_FILTER_OPTIONS = [
  { label: '전체 상태', value: 'ALL' },
  { label: '임시저장', value: SCENARIO_STATUS.DRAFT },
  { label: '준비완료', value: SCENARIO_STATUS.READY },
  { label: '진행중', value: SCENARIO_STATUS.IN_PROGRESS },
  { label: '완료', value: SCENARIO_STATUS.COMPLETED },
  { label: '오류', value: SCENARIO_STATUS.ERROR },
] as const;

export const FIRE_ORIGIN_OPTIONS = [
  '305호 · 동측 창가',
  '302호 · 중앙 복도',
  '301호 · 서측 출입문',
  '복도 천장 센서 구역',
] as const;

export const FIRE_SPREAD_OPTIONS = ['느림', '중간', '빠름'] as const;

export const FIRE_SPREAD_LABEL = {
  SLOW: '느림',
  MEDIUM: '중간',
  FAST: '빠름',
} as const;

export const FIRE_SPREAD_VALUE = {
  느림: 'SLOW',
  중간: 'MEDIUM',
  빠름: 'FAST',
} as const;

export type FireSpreadLabel = keyof typeof FIRE_SPREAD_VALUE;

export const DEFAULT_FIRE_CONDITIONS = [
  { key: 'origin', label: '발화 위치', value: FIRE_ORIGIN_OPTIONS[0] },
  { key: 'spread', label: '확산 속도', value: FIRE_SPREAD_OPTIONS[1] },
] as const satisfies readonly FireConditionField[];

export const FIRE_CONDITION_OPTIONS = {
  origin: FIRE_ORIGIN_OPTIONS,
  spread: FIRE_SPREAD_OPTIONS,
} as const satisfies FireConditionOptions;
