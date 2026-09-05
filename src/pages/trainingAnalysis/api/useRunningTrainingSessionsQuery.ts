import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { LIVE_SESSION_POLL_INTERVAL_MS } from '@pages/trainingAnalysis/constants/trainingAnalysis';
import type { TrainingSessionSummary } from '@pages/trainingAnalysis/types/trainingAnalysis';

import type { TrainingSessionSummaryResponse } from '@apis/__generated__/data-contracts';
import {
  SESSION_DISCOVERY_POLL_INTERVAL_MS,
  TRAINING_SESSION_STATUS,
} from '@apis/trainingSessions/trainingSessionConstants';
import { trainingSessionQueryKeys } from '@apis/trainingSessions/trainingSessionQueryKeys';
import { getTrainingSessions } from '@apis/trainingSessions/trainingSessionsApi';

// 필수 필드가 누락된 세션 하나 때문에 목록 전체가 렌더링 중 throw로 죽지 않도록,
// 예외 대신 null을 반환해 그 항목만 조용히 건너뜀
const toTrainingSessionSummary = (
  response: TrainingSessionSummaryResponse,
): TrainingSessionSummary | null => {
  const { sessionId, scenarioId, scenarioName, buildingId, buildingName, status, startedAt } =
    response;
  if (!sessionId || !scenarioName || !buildingId || !buildingName || !status || !startedAt) {
    return null;
  }
  return { sessionId, scenarioId, scenarioName, buildingId, buildingName, status, startedAt };
};

// 훈련분석 첫 화면(목록)에서만 쓰는, 진행 중(RUNNING) 훈련만 보는 쿼리.
// "첫 화면은 진행 중인 훈련만 보여준다"는 팀 결정에 따른 범위 제한임(기술적 제약이 아님) —
// 백엔드가 종료된 세션의 모니터링 조회도 열어줘서(스웨거: "세션 상태와 무관하게 조회할 수
// 있으며, 종료된 세션은 훈련 중 마지막으로 저장된 캡처를 그대로 보여줍니다", 실제 호출로도 확인)
// 지난 훈련 다시보기가 필요해지면 이 쿼리의 상태 조건만 넓히면 됨.
// 상세 화면(카메라/프레임)의 세션 정보는 목록이 아니라 monitoring/context를 기준으로
// 삼음(useSessionContextQuery) — 종료 시각·경과 시간·저장 간격 등 목록 API엔 없는 필드가
// 필요해서, 그리고 스웨거 설명대로 종료된 세션도 그대로 조회되므로 딥링크·새로고침도 문제없음
export const useRunningTrainingSessionsQuery = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: trainingSessionQueryKeys.list(TRAINING_SESSION_STATUS.RUNNING),
    queryFn: ({ signal }) => getTrainingSessions(TRAINING_SESSION_STATUS.RUNNING, signal),
    // 실행 세션이나 정상 응답이 없을 때도 낮은 빈도로 조회해 다른 클라이언트의 시작과
    // 일시적인 조회 오류를 자동 복구한다.
    refetchInterval: (query) =>
      query.state.data?.length ? LIVE_SESSION_POLL_INTERVAL_MS : SESSION_DISCOVERY_POLL_INTERVAL_MS,
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
