// 홈 대시보드 관련 조회 캐시를 관리하는 쿼리키 팩토리
export const dashboardQueryKeys = {
  // 대시보드 전체 쿼리의 루트 키
  all: ['dashboard'] as const,

  // 대시보드 요약 통계 쿼리키
  stats: () => [...dashboardQueryKeys.all, 'stats'] as const,
  // 최근 훈련 리포트 목록 쿼리키
  recentTrainings: () => [...dashboardQueryKeys.all, 'trainings'] as const,

  // 세션별 홈 훈련 상태 상세 쿼리의 공통 키
  trainingStatuses: () => [...dashboardQueryKeys.all, 'training-status'] as const,
  // 특정 세션의 홈 훈련 상태 상세 쿼리키
  trainingStatus: (sessionId?: string) =>
    [...dashboardQueryKeys.trainingStatuses(), sessionId] as const,
};
