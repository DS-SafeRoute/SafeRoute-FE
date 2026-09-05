import { useEffect, useState } from 'react';

import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { useGetTrainingSessionsQuery } from '@apis/trainingSessions/useGetTrainingSessionsQuery';

import type { TrainingSessionStatus } from '../types/trainingAnalysis';

interface UseTrainingScenarioIdParams {
  sessionId?: string;
  status?: TrainingSessionStatus;
  routedScenarioId: string | null;
}

// 라우터 state가 없는 직접 진입에서도 세션 목록 응답으로 시나리오를 복구한다.
export const useTrainingScenarioId = ({
  sessionId,
  status,
  routedScenarioId,
}: UseTrainingScenarioIdParams) => {
  const [rememberedScenario, setRememberedScenario] = useState({
    sessionId,
    scenarioId: routedScenarioId,
  });
  const rememberedScenarioId =
    rememberedScenario.sessionId === sessionId ? rememberedScenario.scenarioId : null;
  const { data: runningSessions = [] } = useGetTrainingSessionsQuery(
    TRAINING_SESSION_STATUS.RUNNING,
    { shouldPoll: false },
  );
  const shouldFindFailedSession =
    status === TRAINING_SESSION_STATUS.FAILED && !routedScenarioId && !rememberedScenarioId;
  const { data: failedSessions = [], isLoading: isFailedSessionsLoading } =
    useGetTrainingSessionsQuery(TRAINING_SESSION_STATUS.FAILED, {
      enabled: shouldFindFailedSession,
      shouldPoll: false,
    });
  const matchedSession = [...runningSessions, ...failedSessions].find(
    (session) => session.sessionId === sessionId,
  );
  const scenarioId = routedScenarioId ?? rememberedScenarioId ?? matchedSession?.scenarioId ?? null;

  useEffect(() => {
    if (scenarioId && scenarioId !== rememberedScenarioId) {
      setRememberedScenario({ sessionId, scenarioId });
    }
  }, [rememberedScenarioId, scenarioId, sessionId]);

  return {
    scenarioId,
    isResolvingScenarioId: shouldFindFailedSession && isFailedSessionsLoading,
  };
};
