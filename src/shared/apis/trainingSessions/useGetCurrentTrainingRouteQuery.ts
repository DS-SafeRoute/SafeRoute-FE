import { useQuery } from '@tanstack/react-query';

import { trainingSessionQueryKeys } from './trainingSessionQueryKeys';
import { getCurrentTrainingRoute } from './trainingSessionsApi';

export const useGetCurrentTrainingRouteQuery = (sessionId?: string | null, enabled = true) =>
  useQuery({
    queryKey: trainingSessionQueryKeys.currentRoute(sessionId ?? undefined),
    queryFn: ({ signal }) => {
      if (!sessionId) throw new Error('현재 경로를 조회할 훈련 세션 ID가 필요합니다.');
      return getCurrentTrainingRoute(sessionId, signal);
    },
    enabled: enabled && Boolean(sessionId),
  });
