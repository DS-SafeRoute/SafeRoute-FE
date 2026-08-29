export const API_V1 = '/api/v1';
export const DASHBOARD_API = '/api/dashboard';

export const API_ENDPOINTS = {
  // 사용자
  AUTH: {
    LOGIN: `${API_V1}/auth/login`,
    LOGOUT: `${API_V1}/auth/logout`,
    SIGNUP: `${API_V1}/auth/signup`,
  },

  USERS: {
    ME: `${API_V1}/users/me`,
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
    IMAGE_URL: (buildingId: string, floorId: string) =>
      `${API_V1}/buildings/${buildingId}/floors/${floorId}/image-url`,
  },

  // S3 파일 업로드
  FILES: {
    UPLOAD: `${API_V1}/s3/upload`,
  },

  // 훈련 세션
  TRAINING_SESSIONS: {
    ROOT: `${API_V1}/sessions`,
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

  // CCTV
  CCTV: {
    ROOT: `${API_V1}/cctvs`,
    DETAIL: (cctvId: string) => `${API_V1}/cctvs/${cctvId}`,
    GRID_CELLS: (cctvId: string) => `${API_V1}/cctvs/${cctvId}/grid-cells`,
    DEVICE_TOKEN: (cctvId: string) => `${API_V1}/cctvs/${cctvId}/device-token`,
    ENABLE: (cctvId: string) => `${API_V1}/cctvs/${cctvId}/enable`,
    DISABLE: (cctvId: string) => `${API_V1}/cctvs/${cctvId}/disable`,
  },

  // 층 그리드 (CCTV 시야 구역 등에서 참조하는 셀 단위)
  FLOOR_GRID: {
    ROOT: (floorId: string) => `${API_V1}/floors/${floorId}/grid`,
    CELLS: (floorId: string) => `${API_V1}/floors/${floorId}/grid/cells`,
  },

  // 맵 그래프, 맵 그래프 편집
  MAP_GRAPH: {
    DETAIL: (floorId: string) => `${API_V1}/floors/${floorId}/graph`,
    CREATE_NODE: (floorId: string) => `${API_V1}/floors/${floorId}/nodes`,
    NODE: (nodeId: string) => `${API_V1}/nodes/${nodeId}`,
    CREATE_EDGE: `${API_V1}/edges`,
    EDGE: (edgeId: string) => `${API_V1}/edges/${edgeId}`,
  },

  // 사용자 지정 영역 (그리드 셀 집합)
  USER_ZONES: {
    ROOT: (floorId: string) => `${API_V1}/floors/${floorId}/user-zones`,
    DETAIL: (floorId: string, userZoneId: string) =>
      `${API_V1}/floors/${floorId}/user-zones/${userZoneId}`,
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
