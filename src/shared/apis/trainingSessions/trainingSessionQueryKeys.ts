import type { TrainingSessionStatus } from './trainingSessionsApi';

export const trainingSessionQueryKeys = {
  all: ['training-sessions'] as const,
  // 상태별 세션 목록 쿼리의 공통 키
  lists: () => [...trainingSessionQueryKeys.all, 'list'] as const,
  // 특정 상태의 세션 목록 쿼리키
  list: (status: TrainingSessionStatus) => [...trainingSessionQueryKeys.lists(), status] as const,
};
