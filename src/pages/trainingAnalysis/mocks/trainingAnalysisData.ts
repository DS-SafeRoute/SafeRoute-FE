import type {
  CongestionLevel,
  MonitoringCamera,
  MonitoringEvent,
  MonitoringFrame,
  TrainingSessionSummary,
} from '../types/trainingAnalysis';

// mock sessionId 'session-1' 기준 데이터. API 연동 전까지 화면 검증용
export const mockSessions: TrainingSessionSummary[] = [
  {
    sessionId: 'session-1',
    scenarioName: '2026년 4월 정기 훈련',
    buildingId: 'building-1',
    buildingName: 'A동 · 본관',
    status: 'COMPLETED',
    startedAt: '2026-04-15T10:00:00',
  },
  {
    sessionId: 'session-2',
    scenarioName: '3학년 A동 화재 대피 훈련',
    buildingId: 'building-1',
    buildingName: 'A동 · 본관',
    status: 'RUNNING',
    startedAt: '2026-04-16T09:00:00',
  },
  {
    sessionId: 'session-3',
    scenarioName: '3월 야간 대피 훈련',
    buildingId: 'building-2',
    buildingName: 'B동 · 별관',
    status: 'COMPLETED',
    startedAt: '2026-03-20T14:00:00',
  },
  {
    sessionId: 'session-4',
    scenarioName: '신입생 대상 대피 훈련',
    buildingId: 'building-3',
    buildingName: 'C동 · 체육관',
    status: 'FAILED',
    startedAt: '2026-03-05T11:00:00',
  },
];

const CAPTURED_BASE = new Date('2026-04-15T10:14:30').getTime();

export const mockCameras: MonitoringCamera[] = [
  {
    cctvId: 'cctv-1',
    code: 'CAM-1',
    name: 'CAM-1',
    buildingName: 'A동',
    floorName: '1층',
    location: '비상구 A-1층',
    thumbnailUrl: 'mock://cam-1',
    capturedAt: CAPTURED_BASE,
    urlExpiresAt: CAPTURED_BASE + 60 * 60 * 1000,
  },
  {
    cctvId: 'cctv-2',
    code: 'CAM-2',
    name: 'CAM-2',
    buildingName: 'A동',
    floorName: '1층',
    location: '비상구 B-1층',
    thumbnailUrl: 'mock://cam-2',
    capturedAt: CAPTURED_BASE - 5_000,
    urlExpiresAt: CAPTURED_BASE - 5_000 + 60 * 60 * 1000,
  },
  {
    cctvId: 'cctv-3',
    code: 'CAM-3',
    name: 'CAM-3',
    buildingName: 'A동',
    floorName: '2층',
    location: '계단실 A-2층',
    thumbnailUrl: 'mock://cam-3',
    capturedAt: CAPTURED_BASE - 2_000,
    urlExpiresAt: CAPTURED_BASE - 2_000 + 60 * 60 * 1000,
  },
  {
    cctvId: 'cctv-4',
    code: 'CAM-4',
    name: 'CAM-4',
    buildingName: 'A동',
    floorName: '2층',
    location: '계단실 B-2층',
    thumbnailUrl: 'mock://cam-4',
    capturedAt: CAPTURED_BASE - 1_000,
    urlExpiresAt: CAPTURED_BASE - 1_000 + 60 * 60 * 1000,
  },
  {
    cctvId: 'cctv-5',
    code: 'CAM-5',
    name: 'CAM-5',
    buildingName: 'A동',
    floorName: '3층',
    location: '복도 - 3층',
    thumbnailUrl: null,
    capturedAt: null,
    urlExpiresAt: null,
  },
  {
    cctvId: 'cctv-6',
    code: 'CAM-6',
    name: 'CAM-6',
    buildingName: 'A동',
    floorName: '1층',
    location: '중앙홀 - 1층',
    thumbnailUrl: 'mock://cam-6',
    capturedAt: CAPTURED_BASE - 3_000,
    urlExpiresAt: CAPTURED_BASE - 3_000 + 60 * 60 * 1000,
  },
];

const FRAME_BASE = new Date('2026-04-15T10:14:00').getTime();

// 좌우 스크롤 버튼·페이지 표기(n/총개수) 확인용으로 20개 정도 필요해서 패턴을 돌려서 생성
const FRAME_CONGESTION_PATTERN: CongestionLevel[] = [
  'NORMAL',
  'NORMAL',
  'NORMAL',
  'CAUTION',
  'CROWDED',
  'VERY_CROWDED',
  'CROWDED',
  'CAUTION',
  'NORMAL',
  'NORMAL',
  'NORMAL',
  'CAUTION',
  'CROWDED',
  'VERY_CROWDED',
  'VERY_CROWDED',
  'CROWDED',
  'CAUTION',
  'NORMAL',
  'NORMAL',
  'NORMAL',
];

const FRAME_PROFILE: Record<CongestionLevel, { headcount: number; density: number }> = {
  NORMAL: { headcount: 3, density: 1.2 },
  CAUTION: { headcount: 6, density: 2.7 },
  CROWDED: { headcount: 8, density: 3.8 },
  VERY_CROWDED: { headcount: 10, density: 5.2 },
};

export const mockFrames: MonitoringFrame[] = FRAME_CONGESTION_PATTERN.map((congestionLevel, i) => {
  const capturedAt = FRAME_BASE + i * 5_000;
  const profile = FRAME_PROFILE[congestionLevel];
  return {
    frameId: `frame-${i + 1}`,
    capturedAt,
    imageUrl: `mock://frame-${i + 1}`,
    urlExpiresAt: capturedAt + 60 * 60 * 1000,
    headcount: profile.headcount,
    density: profile.density,
    congestionLevel,
  } satisfies MonitoringFrame;
});

export const mockEvents: MonitoringEvent[] = [
  {
    eventId: 'event-1',
    type: 'CONGESTION_STARTED',
    severity: 'INFO',
    occurredAt: FRAME_BASE,
    cctvCode: 'CAM-1',
    congestionLevel: 'NORMAL',
    message: 'AI 분석 시작',
  },
  {
    eventId: 'event-2',
    type: 'CONGESTION_LEVEL_UP',
    severity: 'WARNING',
    occurredAt: FRAME_BASE + 10 * 60 * 1000,
    cctvCode: 'CAM-3',
    congestionLevel: 'CROWDED',
    message: '병목 감지 · 계단 A구역',
  },
  {
    eventId: 'event-3',
    type: 'ROUTE_RECALCULATION_REQUESTED',
    severity: 'DANGER',
    occurredAt: FRAME_BASE + 15 * 60 * 1000,
    cctvCode: 'CAM-1',
    congestionLevel: 'VERY_CROWDED',
    message: '위험 구역 진입 · 3층 복도',
  },
  {
    eventId: 'event-4',
    type: 'EVACUATION_ROUTE_UPDATED',
    severity: 'WARNING',
    occurredAt: FRAME_BASE + 35 * 60 * 1000,
    cctvCode: 'CAM-2',
    congestionLevel: 'CAUTION',
    message: '경로 이탈 감지 · 서측 복도',
  },
];
