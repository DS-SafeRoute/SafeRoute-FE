const API_V1 = '/api/v1';
const DASHBOARD_API = '/api/dashboard';

export const API_ENDPOINTS = {
  // 사용자
  AUTH: {
    LOGIN: `${API_V1}/auth/login`,
    SIGNUP: `${API_V1}/auth/signup`,
  },

  // 건물
  BUILDINGS: {
    ROOT: `${API_V1}/buildings`,
    DETAIL: (buildingId: string) => `${API_V1}/buildings/${buildingId}`,
    DEACTIVATE: (buildingId: string) => `${API_V1}/buildings/${buildingId}/deactivate`,
  },

  // 층/도면, AI 분석
  FLOORS: {
    ROOT: (buildingId: string) => `${API_V1}/buildings/${buildingId}/floors`,
    DETAIL: (buildingId: string, floorId: string) =>
      `${API_V1}/buildings/${buildingId}/floors/${floorId}`,
    UPLOAD: (buildingId: string) => `${API_V1}/buildings/${buildingId}/floors/upload`,
    ANALYZE: (floorId: string) => `${API_V1}/${floorId}/analyse`,
  },

  // S3 파일 업로드
  FILES: {
    UPLOAD: `${API_V1}/s3/upload`,
  },

  // 훈련 세션
  TRAINING_SESSIONS: {
    CREATE: (scenarioId: string) => `${API_V1}/sessions/${scenarioId}`,
    START: (sessionId: string) => `${API_V1}/sessions/${sessionId}/start`,
    END: (sessionId: string) => `${API_V1}/sessions/${sessionId}/end`,
    FORCE_END: (sessionId: string) => `${API_V1}/sessions/${sessionId}/force-end`,
  },

  // 훈련 시나리오
  SCENARIOS: {
    ROOT: `${API_V1}/scenarios`,
    DETAIL: (scenarioId: string) => `${API_V1}/scenarios/${scenarioId}`,
  },

  // 훈련 리포트
  TRAINING_REPORTS: {
    CREATE: (sessionId: string) => `${API_V1}/analysis/trainings/${sessionId}`,
  },

  // 대시보드
  DASHBOARD: {
    STATS: `${DASHBOARD_API}/stats`,
    RECENT_TRAININGS: `${DASHBOARD_API}/trainings`,
    TRAINING_STATUS: (sessionId: string) => `${DASHBOARD_API}/training-status/${sessionId}`,
  },

  // IoT 유도등
  IOT_LIGHTS: {
    ROOT: `${API_V1}/lights`,
    DETAIL: (lightId: string) => `${API_V1}/lights/${lightId}`,
    PI_ENDPOINT: (lightId: string) => `${API_V1}/lights/${lightId}/pi-endpoint`,
    GUIDANCE: (lightId: string) => `${API_V1}/lights/${lightId}/guidance`,
    ENABLE: (lightId: string) => `${API_V1}/lights/${lightId}/enable`,
    DISABLE: (lightId: string) => `${API_V1}/lights/${lightId}/disable`,
    DIRECTION: (lightId: string) => `${API_V1}/lights/${lightId}/direction`,
  },

  // 맵 그래프, 맵 그래프 편집
  MAP_GRAPH: {
    DETAIL: (floorId: string) => `${API_V1}/floors/${floorId}/graph`,
    CREATE_NODE: (floorId: string) => `${API_V1}/floors/${floorId}/nodes`,
    NODE: (nodeId: string) => `${API_V1}/nodes/${nodeId}`,
    CREATE_EDGE: `${API_V1}/edges`,
    EDGE: (edgeId: string) => `${API_V1}/edges/${edgeId}`,
  },

  // 대피 경로
  EVACUATION_ROUTES: {
    SHORTEST: (floorId: string) => `${API_V1}/floors/${floorId}/routes`,
  },

  // 혼잡도
  CONGESTION_EVENTS: {
    ROOT: `${API_V1}/congestion-events`,
  },

  // 재탐색 승인
  ROUTE_RECALCULATIONS: {
    APPROVE: (recalculationId: string) =>
      `${API_V1}/route-recalculations/${recalculationId}/approve`,
    REJECT: (recalculationId: string) => `${API_V1}/route-recalculations/${recalculationId}/reject`,
  },
} as const;
