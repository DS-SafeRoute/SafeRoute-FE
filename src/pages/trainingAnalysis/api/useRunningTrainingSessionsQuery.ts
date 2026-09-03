import { useEffect, useMemo, useRef } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';

import { LIVE_SESSION_POLL_INTERVAL_MS } from '@pages/trainingAnalysis/constants/trainingAnalysis';
import type { TrainingSessionSummary } from '@pages/trainingAnalysis/types/trainingAnalysis';

import type { TrainingSessionSummaryResponse } from '@apis/__generated__/data-contracts';
import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { trainingSessionQueryKeys } from '@apis/trainingSessions/trainingSessionQueryKeys';
import { getTrainingSessions } from '@apis/trainingSessions/trainingSessionsApi';

// 필수 필드가 누락된 세션 하나 때문에 목록 전체가 렌더링 중 throw로 죽지 않도록,
// 예외 대신 null을 반환해 그 항목만 조용히 건너뜀
const toTrainingSessionSummary = (
  response: TrainingSessionSummaryResponse,
): TrainingSessionSummary | null => {
  const { sessionId, scenarioName, buildingId, buildingName, status, startedAt } = response;
  if (!sessionId || !scenarioName || !buildingId || !buildingName || !status || !startedAt) {
    return null;
  }
  return { sessionId, scenarioName, buildingId, buildingName, status, startedAt };
};

// 훈련분석은 진행 중(RUNNING) 훈련과 종료된(COMPLETED/FAILED) 훈련을 모두 대상으로 함.
// status가 필수 파라미터라 상태별로 나눠 호출해서 합침.
// 세 목록을 모두 같은 주기로 갱신하는 이유: RUNNING만 갱신하면 훈련이 끝나는 순간
// RUNNING 목록에서는 빠지는데 COMPLETED 목록은 옛 데이터라 세션이 어디에도 없는 순간이 생기고,
// 상세 화면(카메라/프레임)이 "없는 세션"으로 판단해 목록으로 튕겨나감
export const useViewableTrainingSessionsQuery = () => {
  // RUNNING은 항상 감시해야 새로 시작된 훈련을 놓치지 않지만, 진행 중인 훈련이 하나도 없으면
  // COMPLETED/FAILED는 정적인 과거 목록이라 5초마다 다시 조회할 이유가 없음(한 렌더 지연 허용 —
  // 진행 중 훈련이 막 사라진 순간에도 최소 한 주기는 더 같이 갱신되어 기존 "빈틈" 문제는 그대로 방지됨)
  const hasRunningRef = useRef(false);

  const [running, completed, failed] = useQueries({
    queries: [
      TRAINING_SESSION_STATUS.RUNNING,
      TRAINING_SESSION_STATUS.COMPLETED,
      TRAINING_SESSION_STATUS.FAILED,
    ].map((status) => ({
      queryKey: trainingSessionQueryKeys.list(status),
      queryFn: ({ signal }: { signal: AbortSignal }) => getTrainingSessions(status, signal),
      refetchInterval:
        status === TRAINING_SESSION_STATUS.RUNNING || hasRunningRef.current
          ? LIVE_SESSION_POLL_INTERVAL_MS
          : false,
    })),
  });

  // 렌더 도중이 아니라 커밋 이후(effect)에 갱신 — StrictMode의 렌더 2회 호출이나 중단된
  // 렌더 패스가 ref 값을 오염시키지 않도록 함
  useEffect(() => {
    hasRunningRef.current = (running.data?.length ?? 0) > 0;
  }, [running.data]);

  // useQueries 결과 배열 자체는 매 렌더마다 새 참조라 useMemo 의존성으로 못 씀 —
  // 각 쿼리의 data만 뽑아서 의존성에 넣음(react-query가 data 참조는 안정적으로 유지해줌)
  const sessions = useMemo(
    () =>
      [...(running.data ?? []), ...(completed.data ?? []), ...(failed.data ?? [])]
        .map(toTrainingSessionSummary)
        .filter((session): session is TrainingSessionSummary => session !== null)
        .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)),
    [running.data, completed.data, failed.data],
  );

  return {
    sessions,
    isLoading: running.isLoading || completed.isLoading || failed.isLoading,
    isError: running.isError || completed.isError || failed.isError,
  };
};

// 훈련분석 첫 화면(목록)에서만 쓰는, 진행 중(RUNNING) 훈련만 보는 쿼리.
// "첫 화면은 진행 중인 훈련만 보여준다"는 팀 결정에 따른 범위 제한임(기술적 제약이 아님) —
// 백엔드가 종료된 세션의 모니터링 조회도 열어줘서(스웨거: "세션 상태와 무관하게 조회할 수
// 있으며, 종료된 세션은 훈련 중 마지막으로 저장된 캡처를 그대로 보여줍니다", 실제 호출로도 확인)
// 지난 훈련 다시보기가 필요해지면 이 쿼리의 상태 조건만 넓히면 됨.
// 상세 화면(카메라/프레임)이 쓰는 아래 useTrainingSessionQuery는 딥링크·새로고침으로 종료된
// 세션에 직접 들어오는 경우까지 받아주려고 기존대로 세 상태를 모두 조회함
export const useRunningTrainingSessionsQuery = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: trainingSessionQueryKeys.list(TRAINING_SESSION_STATUS.RUNNING),
    queryFn: ({ signal }) => getTrainingSessions(TRAINING_SESSION_STATUS.RUNNING, signal),
    // 훈련이 새로 시작되면 목록에 알아서 나타나도록 계속 지켜봄
    refetchInterval: LIVE_SESSION_POLL_INTERVAL_MS,
    // 기본값(false)이면 창이 포커스를 잃는 순간 폴링이 멈춤 — 관제 화면처럼 띄워만 두는 경우
    // "자동 갱신"이라고 안내해놓고 실제로는 멈춰 있게 되어서 백그라운드에서도 계속 돌게 함
    refetchIntervalInBackground: true,
  });

  const sessions = useMemo(
    () =>
      (data ?? [])
        .map(toTrainingSessionSummary)
        .filter((session): session is TrainingSessionSummary => session !== null)
        .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)),
    [data],
  );

  return { sessions, isLoading, isError };
};

// 세션 상세 조회 API가 따로 없어서(목록만 있음), 목록 쿼리 캐시에서 찾아 씀 — 목록 화면을
// 거쳐 들어온 경우 대부분 이미 캐시돼 있어 추가 요청 없이 바로 뜨고, 새로고침/딥링크로 바로
// 들어온 경우에도 COMPLETED+FAILED 재조회 한 번으로 해결됨
export const useTrainingSessionQuery = (sessionId: string | undefined) => {
  const { sessions, isLoading, isError } = useViewableTrainingSessionsQuery();
  const session = sessions.find((s) => s.sessionId === sessionId);
  return { session, isLoading, isError };
};
