import { useQuery } from '@tanstack/react-query';

import {
  isLiveSessionStatus,
  LIVE_SESSION_POLL_INTERVAL_MS,
} from '@pages/trainingAnalysis/constants/trainingAnalysis';

import { getSessionContext } from './monitoringApi';
import { monitoringQueryKeys } from './monitoringQueryKeys';

// 세션 상세(카메라 목록·프레임 상세) 화면이 세션 정보의 기준으로 삼는 조회.
// 응답 자체에 status가 있어서(진행 중이면 계속 폴링) 다른 훅들처럼 live 여부를 밖에서
// 넘겨받을 필요 없이 스스로 판단함 — 최초 로드(아직 status를 모르는 시점)에도 한 번은
// 반드시 조회해야 하니 refetchInterval 함수의 조건은 "안 살아있으면 멈춤"으로만 걺
export const useSessionContextQuery = (sessionId: string | undefined) =>
  useQuery({
    queryKey: monitoringQueryKeys.context(sessionId ?? ''),
    queryFn: ({ signal }) => getSessionContext(sessionId as string, signal),
    enabled: Boolean(sessionId),
    refetchInterval: (query) =>
      isLiveSessionStatus(query.state.data?.status) ? LIVE_SESSION_POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: true,
  });

// 카메라 목록·프레임 상세 화면에서 기존 이름 그대로 쓰기 위한 얇은 래퍼.
// 예전엔 세션 목록 캐시에서 찾아 썼지만(useViewableTrainingSessionsQuery), 종료 시각·경과
// 시간·저장 간격 등 상세 화면 전용 필드가 목록 API엔 없어서 context 조회로 교체함
export const useTrainingSessionQuery = (sessionId: string | undefined) => {
  const { data: session, isLoading, isError, error } = useSessionContextQuery(sessionId);
  return { session, isLoading, isError, error };
};
