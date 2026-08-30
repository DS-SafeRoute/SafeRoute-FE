import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { LIVE_SESSION_POLL_INTERVAL_MS } from '@pages/trainingAnalysis/constants/trainingAnalysis';
import type { TrainingSessionSummary } from '@pages/trainingAnalysis/types/trainingAnalysis';

import type { TrainingSessionSummaryResponse } from '@apis/__generated__/data-contracts';
import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { trainingSessionQueryKeys } from '@apis/trainingSessions/trainingSessionQueryKeys';
import { getTrainingSessions } from '@apis/trainingSessions/trainingSessionsApi';

const toTrainingSessionSummary = (
  response: TrainingSessionSummaryResponse,
): TrainingSessionSummary => {
  const { sessionId, scenarioName, buildingId, buildingName, status, startedAt } = response;
  if (!sessionId || !scenarioName || !buildingId || !buildingName || !status || !startedAt) {
    throw new Error('훈련 세션 응답에 필수 필드가 누락되었습니다.');
  }
  return { sessionId, scenarioName, buildingId, buildingName, status, startedAt };
};

// 훈련분석은 진행 중(RUNNING) 훈련과 종료된(COMPLETED/FAILED) 훈련을 모두 대상으로 함.
// status가 필수 파라미터라 상태별로 나눠 호출해서 합침.
// 세 목록을 모두 같은 주기로 갱신하는 이유: RUNNING만 갱신하면 훈련이 끝나는 순간
// RUNNING 목록에서는 빠지는데 COMPLETED 목록은 옛 데이터라 세션이 어디에도 없는 순간이 생기고,
// 상세 화면(카메라/프레임)이 "없는 세션"으로 판단해 목록으로 튕겨나감
export const useViewableTrainingSessionsQuery = () => {
  const [running, completed, failed] = useQueries({
    queries: [
      TRAINING_SESSION_STATUS.RUNNING,
      TRAINING_SESSION_STATUS.COMPLETED,
      TRAINING_SESSION_STATUS.FAILED,
    ].map((status) => ({
      queryKey: trainingSessionQueryKeys.list(status),
      queryFn: ({ signal }: { signal: AbortSignal }) => getTrainingSessions(status, signal),
      refetchInterval: LIVE_SESSION_POLL_INTERVAL_MS,
    })),
  });

  // useQueries 결과 배열 자체는 매 렌더마다 새 참조라 useMemo 의존성으로 못 씀 —
  // 각 쿼리의 data만 뽑아서 의존성에 넣음(react-query가 data 참조는 안정적으로 유지해줌)
  const sessions = useMemo(
    () =>
      [...(running.data ?? []), ...(completed.data ?? []), ...(failed.data ?? [])]
        .map(toTrainingSessionSummary)
        .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)),
    [running.data, completed.data, failed.data],
  );

  return {
    sessions,
    isLoading: running.isLoading || completed.isLoading || failed.isLoading,
    isError: running.isError || completed.isError || failed.isError,
  };
};

// 세션 상세 조회 API가 따로 없어서(목록만 있음), 목록 쿼리 캐시에서 찾아 씀 — 목록 화면을
// 거쳐 들어온 경우 대부분 이미 캐시돼 있어 추가 요청 없이 바로 뜨고, 새로고침/딥링크로 바로
// 들어온 경우에도 COMPLETED+FAILED 재조회 한 번으로 해결됨
export const useTrainingSessionQuery = (sessionId: string | undefined) => {
  const { sessions, isLoading, isError } = useViewableTrainingSessionsQuery();
  const session = sessions.find((s) => s.sessionId === sessionId);
  return { session, isLoading, isError };
};
