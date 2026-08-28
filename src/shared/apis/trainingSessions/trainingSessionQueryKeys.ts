import type { TrainingSessionStatus } from './trainingSessionsApi';

// 훈련 세션 관련 조회 캐시를 관리하는 쿼리키 팩토리
export const trainingSessionQueryKeys = {
  // 훈련 세션 전체 쿼리의 루트 키
  all: ['training-sessions'] as const,
  // 상태별 세션 목록 쿼리의 공통 키
  lists: () => [...trainingSessionQueryKeys.all, 'list'] as const,
  // 특정 상태의 세션 목록 쿼리키
  list: (status: TrainingSessionStatus) => [...trainingSessionQueryKeys.lists(), status] as const,
  // 홈 훈련 상태 상세 쿼리의 공통 키
  statuses: () => [...trainingSessionQueryKeys.all, 'status'] as const,
  // 세션별 홈 훈련 상태 상세 쿼리키
  status: (sessionId: string) => [...trainingSessionQueryKeys.statuses(), sessionId] as const,
};
