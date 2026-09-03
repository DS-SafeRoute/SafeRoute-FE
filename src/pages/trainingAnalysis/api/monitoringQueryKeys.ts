// 훈련분석 모니터링(카메라 목록/프레임/이벤트) 조회 캐시를 관리하는 쿼리키 팩토리
export const monitoringQueryKeys = {
  all: ['training-analysis-monitoring'] as const,

  context: (sessionId: string) => [...monitoringQueryKeys.all, 'context', sessionId] as const,

  cameras: (sessionId: string) => [...monitoringQueryKeys.all, 'cameras', sessionId] as const,

  currentStates: (sessionId: string) =>
    [...monitoringQueryKeys.all, 'current-states', sessionId] as const,

  // cctvId 없이 세션 전체를 대상으로 무효화할 때 쓰는 접두 키(예: 훈련 상태 변경 시 선택 카메라와
  // 무관하게 모든 프레임 캐시를 무효화해야 함)
  frames: (sessionId: string) => [...monitoringQueryKeys.all, 'frames', sessionId] as const,

  frameLists: (sessionId: string, cctvId: string) =>
    [...monitoringQueryKeys.frames(sessionId), cctvId] as const,

  // cctvCode 없이 세션 전체를 대상으로 무효화할 때 쓰는 접두 키
  eventsRoot: (sessionId: string) => [...monitoringQueryKeys.all, 'events', sessionId] as const,

  events: (sessionId: string, cctvCode?: string) =>
    [...monitoringQueryKeys.eventsRoot(sessionId), cctvCode] as const,
};
