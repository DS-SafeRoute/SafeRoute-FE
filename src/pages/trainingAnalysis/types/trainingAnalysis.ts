// 훈련 세션 상태. 훈련관리(scenarioSettings) 쪽 TrainingSessionStatus와 동일한 값셋이지만
// 아직 이 페이지는 API 연동 전이라 별도로 정의해둠 — API 연동 시 @apis/trainingSessions 쪽 타입으로 교체 예정
export type TrainingSessionStatus =
  | 'RUNNING'
  | 'STOPPED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface TrainingSessionSummary {
  sessionId: string;
  scenarioName: string;
  buildingId: string;
  buildingName: string;
  status: TrainingSessionStatus;
  startedAt: string;
}

// GET /api/v1/sessions/{sessionId}/monitoring/cameras 응답 기준
// headcount 등 실시간 카운터는 이 API에 없어서 목록 카드에는 캡처 시각만 표시
export interface MonitoringCamera {
  cctvId: string;
  code: string;
  name: string;
  buildingName: string;
  floorName: string;
  location: string;
  thumbnailUrl: string | null;
  capturedAt: number | null; // epoch ms, 캡처 프레임 없으면 null
  urlExpiresAt: number | null;
}

export type CongestionLevel = 'NORMAL' | 'CAUTION' | 'CROWDED' | 'VERY_CROWDED';

export const CONGESTION_LEVEL_LABEL: Record<CongestionLevel, string> = {
  NORMAL: '정상',
  CAUTION: '주의',
  CROWDED: '혼잡',
  VERY_CROWDED: '매우 혼잡',
};

// GET /api/v1/sessions/{sessionId}/monitoring/cameras/{cctvId}/frames 응답 기준, 커서 페이징
export interface MonitoringFrame {
  frameId: string;
  capturedAt: number;
  imageUrl: string | null;
  urlExpiresAt: number | null;
  headcount: number;
  density: number;
  congestionLevel: CongestionLevel;
}

export type MonitoringEventType =
  | 'CONGESTION_STARTED'
  | 'CONGESTION_LEVEL_UP'
  | 'CONGESTION_ENDED'
  | 'ROUTE_RECALCULATION_REQUESTED'
  | 'EVACUATION_ROUTE_UPDATED'
  | 'ROUTE_RECALCULATION_REJECTED'
  | 'ROUTE_RECALCULATION_CANCELLED';

export type MonitoringEventSeverity = 'INFO' | 'WARNING' | 'DANGER';

// GET /api/v1/sessions/{sessionId}/monitoring/events 응답 기준
export interface MonitoringEvent {
  eventId: string;
  type: MonitoringEventType;
  severity: MonitoringEventSeverity;
  occurredAt: number;
  cctvCode: string;
  congestionLevel: CongestionLevel;
  message: string;
}
