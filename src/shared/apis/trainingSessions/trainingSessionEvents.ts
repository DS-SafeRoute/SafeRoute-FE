import type { TrainingSessionStatus } from './trainingSessionConstants';

// 훈련 세션 WebSocket에서 수신하는 이벤트 종류
export const TRAINING_EVENT_TYPE = {
  STATUS_UPDATED: 'TRAINING_STATUS_UPDATED',
  CONGESTION_UPDATED: 'CONGESTION_UPDATED',
  CONGESTION_IMAGE_UPDATED: 'CONGESTION_IMAGE_UPDATED',
  CONGESTION_EVENT_RECEIVED: 'CONGESTION_EVENT_RECEIVED',
  CONGESTION_EVENT_IMAGE_UPDATED: 'CONGESTION_EVENT_IMAGE_UPDATED',
  ROUTE_RECALCULATION_REQUESTED: 'ROUTE_RECALCULATION_REQUESTED',
  EVACUATION_ROUTE_UPDATED: 'EVACUATION_ROUTE_UPDATED',
  ROUTE_RECALCULATION_REJECTED: 'ROUTE_RECALCULATION_REJECTED',
  ROUTE_RECALCULATION_CANCELLED: 'ROUTE_RECALCULATION_CANCELLED',
  IOT_LIGHT_STATUS_UPDATED: 'IOT_LIGHT_STATUS_UPDATED',
  FIRE_SPREAD_UPDATED: 'FIRE_SPREAD_UPDATED',
} as const;

export type TrainingEventType = (typeof TRAINING_EVENT_TYPE)[keyof typeof TRAINING_EVENT_TYPE];

// 훈련 상태 변경 이벤트 데이터
export interface TrainingStatusEventData {
  status: TrainingSessionStatus;
  startedAt: string | null;
  endedAt: string | null;
}

// 훈련 세션 WebSocket 이벤트의 공통 응답 형식
export interface TrainingSessionEvent<TData = unknown> {
  eventType: TrainingEventType;
  sessionId: string;
  occurredAt: string;
  data: TData;
}
