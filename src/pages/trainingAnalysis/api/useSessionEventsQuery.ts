import { useQuery } from '@tanstack/react-query';

import { getSessionEvents } from './monitoringApi';
import { monitoringQueryKeys } from './monitoringQueryKeys';

// 세션의 이벤트 타임라인. cctvCode를 넘기면 현재 보고 있는 카메라의 이벤트만 필터링됨
export const useSessionEventsQuery = (
  sessionId: string | undefined,
  cctvCode: string | undefined,
) =>
  useQuery({
    queryKey: monitoringQueryKeys.events(sessionId ?? '', cctvCode),
    queryFn: ({ signal }) => getSessionEvents(sessionId as string, cctvCode, signal),
    enabled: Boolean(sessionId),
  });
