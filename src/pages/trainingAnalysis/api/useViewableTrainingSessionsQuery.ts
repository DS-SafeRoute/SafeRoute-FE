import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import type { TrainingSessionSummaryResponse } from '@apis/__generated__/data-contracts';
import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { trainingSessionQueryKeys } from '@apis/trainingSessions/trainingSessionQueryKeys';
import { getTrainingSessions } from '@apis/trainingSessions/trainingSessionsApi';

import type { TrainingSessionSummary } from '../types/trainingAnalysis';

const toTrainingSessionSummary = (
  response: TrainingSessionSummaryResponse,
): TrainingSessionSummary => {
  const { sessionId, scenarioName, buildingId, buildingName, status, startedAt } = response;
  if (!sessionId || !scenarioName || !buildingId || !buildingName || !status || !startedAt) {
    throw new Error('훈련 세션 응답에 필수 필드가 누락되었습니다.');
  }
  return { sessionId, scenarioName, buildingId, buildingName, status, startedAt };
};

// 훈련분석 목록은 훈련 중에는 열람이 불가능해서 종료된(COMPLETED) 훈련뿐 아니라 실패로
// 끝난(FAILED) 훈련도 대상으로 함 — 실패 전까지 수집된 프레임은 여전히 확인할 가치가 있음.
// status가 필수 파라미터라 상태별로 두 번 호출해서 합침
export const useViewableTrainingSessionsQuery = () => {
  const [completed, failed] = useQueries({
    queries: [TRAINING_SESSION_STATUS.COMPLETED, TRAINING_SESSION_STATUS.FAILED].map((status) => ({
      queryKey: trainingSessionQueryKeys.list(status),
      queryFn: ({ signal }: { signal: AbortSignal }) => getTrainingSessions(status, signal),
    })),
  });

  // useQueries 결과 배열 자체는 매 렌더마다 새 참조라 useMemo 의존성으로 못 씀 —
  // 각 쿼리의 data만 뽑아서 의존성에 넣음(react-query가 data 참조는 안정적으로 유지해줌)
  const sessions = useMemo(
    () =>
      [...(completed.data ?? []), ...(failed.data ?? [])]
        .map(toTrainingSessionSummary)
        .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)),
    [completed.data, failed.data],
  );

  return {
    sessions,
    isLoading: completed.isLoading || failed.isLoading,
    isError: completed.isError || failed.isError,
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
