import type { StatusBadgeColor } from '@components/chip/StatusBadge';

import type {
  MonitoringEventSeverity,
  MonitoringEventType,
  TrainingSessionStatus,
} from '../types/trainingAnalysis';

// 훈련분석 목록은 종료된 훈련(COMPLETED/FAILED)만 대상으로 함 — 진행 중(RUNNING)에는
// 실시간 열람이 불가능해서 목록 진입 자체를 막고, SCHEDULED/STOPPED/CANCELLED는 열람 대상 아님
export const VIEWABLE_SESSION_STATUSES = [
  'COMPLETED',
  'FAILED',
] as const satisfies readonly TrainingSessionStatus[];

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
