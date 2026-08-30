import { useQuery } from '@tanstack/react-query';

import { getSessionEvents } from './monitoringApi';
import { monitoringQueryKeys } from './monitoringQueryKeys';
import { LIVE_SESSION_POLL_INTERVAL_MS } from '../constants/trainingAnalysis';

// 세션의 이벤트 타임라인. cctvCode를 넘기면 현재 보고 있는 카메라의 이벤트만 필터링됨.
// live=true(진행 중 훈련)면 새 이벤트를 반영하려고 주기적으로 다시 조회
export const useSessionEventsQuery = (
  sessionId: string | undefined,
  cctvCode: string | undefined,
  options?: { live?: boolean },
) =>
  useQuery({
    queryKey: monitoringQueryKeys.events(sessionId ?? '', cctvCode),
    queryFn: ({ signal }) => getSessionEvents(sessionId as string, cctvCode, signal),
    enabled: Boolean(sessionId),
    refetchInterval: options?.live ? LIVE_SESSION_POLL_INTERVAL_MS : false,
  });
