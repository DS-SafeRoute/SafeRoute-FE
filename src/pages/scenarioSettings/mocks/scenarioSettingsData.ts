import {
  FIRE_ORIGIN_OPTIONS,
  FIRE_SPREAD_OPTIONS,
  GUIDE_LIGHT_OPTIONS,
  SCENARIO_BUILDING_OPTIONS,
  SMOKE_DENSITY_OPTIONS,
} from '../constants/scenarioSettings';

import type {
  BasicInfo,
  FireConditionField,
  FireConditionOptions,
  PreviewMetric,
  PreviewStatus,
} from '../types/scenarioSettings';

export const basicInfo: BasicInfo = {
  scenarioName: '',
  targetBuilding: SCENARIO_BUILDING_OPTIONS[0],
  scheduledAt: '2026-04-15',
  expectedParticipants: '',
};

export const selectedFireConditions: FireConditionField[] = [
  { key: 'origin', label: '발화 위치', value: FIRE_ORIGIN_OPTIONS[0] },
  { key: 'spread', label: '확산 속도', value: FIRE_SPREAD_OPTIONS[1] },
  { key: 'smoke', label: '연기 밀도', value: SMOKE_DENSITY_OPTIONS[2] },
  { key: 'guideLight', label: '유도등 차단', value: GUIDE_LIGHT_OPTIONS[0] },
];

export const fireConditionOptions: FireConditionOptions = {
  origin: FIRE_ORIGIN_OPTIONS,
  spread: FIRE_SPREAD_OPTIONS,
  smoke: SMOKE_DENSITY_OPTIONS,
  guideLight: GUIDE_LIGHT_OPTIONS,
};

export const recommendationText =
  '과거 7회 훈련에서 1층 로비 밀집도가 평균 92%로 병목이 발생했습니다. 서측 계단 우회 경로를 추가 권장합니다.';

export const previewStatus: PreviewStatus = {
  label: '준비 완료',
  color: 'green',
  dot: true,
};

export const previewMetrics: PreviewMetric[] = [
  { id: 'route', label: '초기 경로 산출', value: '0.5초' },
  { id: 'cctv', label: '감지 CCTV', value: '4대' },
  { id: 'iot', label: '활성 IoT 유도등', value: '12개' },
  { id: 'evacuation', label: '예상 대피 시간', value: '3분 50초' },
];

export const liveStatus: PreviewStatus = {
  label: '진행중',
  color: 'green',
  dot: true,
};

export const liveMetrics: PreviewMetric[] = [
  { id: 'route', label: '마지막 경로 재산출', value: '10초 전' },
  { id: 'cctv', label: '감지 CCTV', value: '4대' },
  { id: 'iot', label: '활성 IoT 유도등', value: '12개' },
  { id: 'evacuation', label: '잔여 예상 대피 시간', value: '1분 30초' },
];

export const currentRouteText = '3층 305호 → 서측 계단 → 1층 로비 출구. 마지막 재산출 10초 전';

export const routeProposalText = '1층 로비 밀집도 92% 감지 · 서측 계단 경유로 우회 경로 재산출';
