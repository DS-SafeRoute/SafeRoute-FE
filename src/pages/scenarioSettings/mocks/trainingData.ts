import type { PreviewMetric, PreviewStatus } from '../types/scenarioSettings';

export const RECOMMENDATION_TEXT =
  '과거 7회 훈련에서 1층 로비 밀집도가 평균 92%로 병목이 발생했습니다. 서측 계단 우회 경로를 추가 권장합니다.';

export const PREVIEW_STATUS: PreviewStatus = {
  label: '준비 완료',
  color: 'green',
  dot: true,
};

export const PREVIEW_METRICS: PreviewMetric[] = [
  { id: 'route', label: '초기 경로 산출', value: '0.5초' },
  { id: 'cctv', label: '감지 CCTV', value: '4대' },
  { id: 'iot', label: '활성 IoT 유도등', value: '12개' },
  { id: 'evacuation', label: '예상 대피 시간', value: '3분 50초' },
];

export const LIVE_STATUS: PreviewStatus = {
  label: '진행중',
  color: 'green',
  dot: true,
};

export const LIVE_METRICS: PreviewMetric[] = [
  { id: 'route', label: '마지막 경로 재산출', value: '10초 전' },
  { id: 'cctv', label: '감지 CCTV', value: '4대' },
  { id: 'iot', label: '활성 IoT 유도등', value: '12개' },
  { id: 'evacuation', label: '잔여 예상 대피 시간', value: '1분 30초' },
];

export const CURRENT_ROUTE_TEXT = '3층 305호 → 서측 계단 → 1층 로비 출구. 마지막 재산출 10초 전';

export const ROUTE_PROPOSAL_TEXT = '1층 로비 밀집도 92% 감지 · 서측 계단 경유로 우회 경로 재산출';

export const PROPOSED_ROUTE_TEXT = '3층 305호 → 서측 계단 → 1층 서측 출구. 마지막 재산출 방금 전';
