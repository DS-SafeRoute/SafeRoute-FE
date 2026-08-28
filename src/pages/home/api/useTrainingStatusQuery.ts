import { useQuery } from '@tanstack/react-query';

import { trainingSessionQueryKeys } from '@apis/trainingSessions/trainingSessionQueryKeys';

import { getTrainingStatus } from './dashboardApi';

// 세션별 홈 훈련 상태 상세 조회 Query
export const useGetTrainingStatusQuery = (sessionId?: string) =>
  useQuery({
    queryKey: trainingSessionQueryKeys.status(sessionId ?? ''),
    queryFn: () => getTrainingStatus(sessionId as string),
    enabled: Boolean(sessionId),
  });
