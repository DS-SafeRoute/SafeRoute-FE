import { useQuery } from '@tanstack/react-query';

import { LIVE_SESSION_POLL_INTERVAL_MS } from '@pages/trainingAnalysis/constants/trainingAnalysis';

import { getSessionCurrentStates } from './monitoringApi';
import { monitoringQueryKeys } from './monitoringQueryKeys';

// 세션의 CCTV별 현재 혼잡 상태(평균/최대 인원·밀집도·혼잡 단계·정보 지연 여부).
// live=true(진행 중 훈련)면 주기적으로 다시 조회 — WebSocket으로 즉시 갱신되는 값이지만,
// 폴링도 같이 돌려서 WS가 잠깐 끊겼던 구간의 stale 판정을 다음 주기에 서버 값으로 바로잡음
export const useSessionCurrentStatesQuery = (
  sessionId: string | undefined,
  options?: { live?: boolean },
) =>
  useQuery({
    queryKey: monitoringQueryKeys.currentStates(sessionId ?? ''),
    queryFn: ({ signal }) => getSessionCurrentStates(sessionId as string, signal),
    enabled: Boolean(sessionId),
    refetchInterval: options?.live ? LIVE_SESSION_POLL_INTERVAL_MS : false,
  });
