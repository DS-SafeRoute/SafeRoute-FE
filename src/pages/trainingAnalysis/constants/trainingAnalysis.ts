import type { StatusBadgeColor } from '@components/chip/StatusBadge';

import type {
  MonitoringEventSeverity,
  MonitoringEventType,
  TrainingSessionStatus,
} from '../types/trainingAnalysis';

// 훈련분석은 진행 중(RUNNING) 훈련과 종료된(COMPLETED/FAILED) 훈련을 대상으로 함.
// RUNNING은 5초 간격으로 최신 CCTV 프레임이 계속 들어와 실시간처럼 갱신되고,
// COMPLETED/FAILED는 훈련 중 수집된 프레임을 사후 열람함.
// SCHEDULED/STOPPED/CANCELLED는 열람 대상 아님
export const VIEWABLE_SESSION_STATUSES = [
  'RUNNING',
  'COMPLETED',
  'FAILED',
] as const satisfies readonly TrainingSessionStatus[];

// 진행 중 훈련은 카메라 목록·프레임·이벤트를 이 주기로 다시 조회해 최신 프레임을 반영함
export const LIVE_SESSION_POLL_INTERVAL_MS = 5000;

export const isLiveSessionStatus = (status: TrainingSessionStatus | undefined) =>
  status === 'RUNNING';

export const TRAINING_SESSION_STATUS_VIEW = {
  RUNNING: { label: '진행 중', color: 'yellow' },
  STOPPED: { label: '중지됨', color: 'neutral' },
  SCHEDULED: { label: '예정', color: 'blue' },
  COMPLETED: { label: '종료', color: 'green' },
  FAILED: { label: '실패', color: 'red' },
  CANCELLED: { label: '취소됨', color: 'neutral' },
} as const satisfies Record<TrainingSessionStatus, { label: string; color: StatusBadgeColor }>;

export const EVENT_SEVERITY_COLOR = {
  INFO: '#2563EB',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
} as const satisfies Record<MonitoringEventSeverity, string>;

export const EVENT_TYPE_LABEL = {
  CONGESTION_STARTED: '혼잡 감지 시작',
  CONGESTION_LEVEL_UP: '혼잡 단계 상승',
  CONGESTION_ENDED: '혼잡 해소',
  ROUTE_RECALCULATION_REQUESTED: '경로 재탐색 요청',
  EVACUATION_ROUTE_UPDATED: '대피 경로 갱신',
  ROUTE_RECALCULATION_REJECTED: '경로 재탐색 거부',
  ROUTE_RECALCULATION_CANCELLED: '경로 재탐색 취소',
} as const satisfies Record<MonitoringEventType, string>;
