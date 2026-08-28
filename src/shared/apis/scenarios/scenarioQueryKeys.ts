// 훈련 시나리오 조회 캐시를 관리하는 쿼리키 팩토리
export const scenarioQueryKeys = {
  // 시나리오 전체 쿼리의 루트 키
  all: ['scenarios'] as const,
  // 시나리오 상세 쿼리키
  detail: (scenarioId: string) => [...scenarioQueryKeys.all, scenarioId] as const,
};
