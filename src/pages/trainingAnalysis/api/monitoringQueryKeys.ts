// 훈련분석 모니터링(카메라 목록/프레임/이벤트) 조회 캐시를 관리하는 쿼리키 팩토리
export const monitoringQueryKeys = {
  all: ['training-analysis-monitoring'] as const,

  cameras: (sessionId: string) => [...monitoringQueryKeys.all, 'cameras', sessionId] as const,

  frameLists: (sessionId: string, cctvId: string) =>
    [...monitoringQueryKeys.all, 'frames', sessionId, cctvId] as const,

  events: (sessionId: string, cctvCode?: string) =>
    [...monitoringQueryKeys.all, 'events', sessionId, cctvCode] as const,
};
