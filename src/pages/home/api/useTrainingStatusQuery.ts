import { useQuery } from '@tanstack/react-query';

import { getTrainingStatus } from './dashboardApi';

export const TRAINING_STATUS_QUERY_KEY = (sessionId: string) =>
  ['training-status', sessionId] as const;

// TODO: 세션 생성/시작 API 연동 후 sessionId를 전달해 UI에 연결
export const useGetTrainingStatusQuery = (sessionId?: string) => {
  return useQuery({
    queryKey: TRAINING_STATUS_QUERY_KEY(sessionId ?? ''),
    queryFn: () => getTrainingStatus(sessionId as string),
    enabled: Boolean(sessionId),
  });
};
