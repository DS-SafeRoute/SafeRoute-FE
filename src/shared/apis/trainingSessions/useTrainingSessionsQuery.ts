import { useQuery } from '@tanstack/react-query';

import { trainingSessionQueryKeys } from './trainingSessionQueryKeys';
import { getTrainingSessions } from './trainingSessionsApi';

import type { TrainingSessionStatus } from './trainingSessionsApi';

// WebSocket 연결 전 세션 탐색과 연결 실패 대비용 조회 주기
const SESSION_REFETCH_INTERVAL_MS = 10_000;

// 특정 상태의 훈련 세션 목록 조회 Query
export const useTrainingSessionsQuery = (status: TrainingSessionStatus, enabled = true) =>
  useQuery({
    queryKey: trainingSessionQueryKeys.list(status),
    queryFn: () => getTrainingSessions(status),
    enabled,
    refetchInterval: SESSION_REFETCH_INTERVAL_MS,
  });
