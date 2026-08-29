import { useQuery } from '@tanstack/react-query';

import { dashboardQueryKeys } from '@apis/dashboard/dashboardQueryKeys';

import { getTrainingStatus } from './dashboardApi';

// 세션별 홈 훈련 상태 상세 조회 Query
export const useGetTrainingStatusQuery = (sessionId?: string) =>
  useQuery({
    queryKey: dashboardQueryKeys.trainingStatus(sessionId),
    queryFn: () => {
      if (!sessionId) throw new Error('훈련 세션 ID가 필요합니다.');
      return getTrainingStatus(sessionId);
    },
    enabled: Boolean(sessionId),
  });
