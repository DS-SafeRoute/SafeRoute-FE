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
