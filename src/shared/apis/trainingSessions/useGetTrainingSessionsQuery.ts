import { useQuery } from '@tanstack/react-query';

import { trainingSessionQueryKeys } from './trainingSessionQueryKeys';
import { getTrainingSessions } from './trainingSessionsApi';

import type { TrainingSessionStatus } from './trainingSessionConstants';

// WebSocket 연결 전 세션 탐색과 연결 실패 대비용 조회 주기
const SESSION_REFETCH_INTERVAL_MS = 10_000;

interface UseGetTrainingSessionsQueryOptions {
  enabled?: boolean;
  shouldPoll?: boolean;
}

// 특정 상태의 훈련 세션 목록 조회 Query
export const useGetTrainingSessionsQuery = (
  status: TrainingSessionStatus,
  { enabled = true, shouldPoll = true }: UseGetTrainingSessionsQueryOptions = {},
) =>
  useQuery({
    queryKey: trainingSessionQueryKeys.list(status),
    queryFn: ({ signal }) => getTrainingSessions(status, signal),
    enabled,
    refetchInterval: shouldPoll ? SESSION_REFETCH_INTERVAL_MS : false,
  });
