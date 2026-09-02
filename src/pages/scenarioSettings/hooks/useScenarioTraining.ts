import { useState } from 'react';

import type { Scenario } from '@pages/scenarioSettings/types/scenarioList';
import { SCENARIO_STATUS } from '@pages/scenarioSettings/types/scenarioList';

import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { useGetTrainingSessionsQuery } from '@apis/trainingSessions/useGetTrainingSessionsQuery';
import {
  useCreateTrainingSessionMutation,
  useEndTrainingSessionMutation,
  useStartTrainingSessionMutation,
} from '@apis/trainingSessions/useTrainingSessionMutations';
import { useTrainingSessionSocket } from '@apis/trainingSessions/websocket/useTrainingSessionSocket';

import { useTrainingRouteData } from './useTrainingRouteData';

interface UseScenarioTrainingParams {
  scenario?: Scenario;
  adminId?: string;
}

export const useScenarioTraining = ({ scenario, adminId }: UseScenarioTrainingParams) => {
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  const [createdSessionStartedAt, setCreatedSessionStartedAt] = useState<string | null>(null);
  const createSessionMutation = useCreateTrainingSessionMutation();
  const startSessionMutation = useStartTrainingSessionMutation();
  const endSessionMutation = useEndTrainingSessionMutation();
  const shouldQuerySessions =
    scenario?.status === SCENARIO_STATUS.READY || scenario?.status === SCENARIO_STATUS.IN_PROGRESS;
  const { data: runningSessions = [], isPending: isRunningSessionsPending } =
    useGetTrainingSessionsQuery(TRAINING_SESSION_STATUS.RUNNING, shouldQuerySessions);
  const { data: scheduledSessions = [], isPending: isScheduledSessionsPending } =
    useGetTrainingSessionsQuery(TRAINING_SESSION_STATUS.SCHEDULED, shouldQuerySessions);
  const runningSession = runningSessions.find(
    (session) =>
      session.scenarioName === scenario?.name && session.buildingId === scenario?.buildingId,
  );
  const scheduledSession = scheduledSessions.find(
    (session) =>
      session.scenarioName === scenario?.name && session.buildingId === scenario?.buildingId,
  );
  const activeSessionId = createdSessionId ?? runningSession?.sessionId ?? null;
  const routeSessionId = activeSessionId ?? scheduledSession?.sessionId ?? null;
  const activeStartedAt = createdSessionStartedAt ?? runningSession?.startedAt ?? null;
  const startedAt = activeStartedAt ? Date.parse(activeStartedAt) : null;
  const isRunning = activeSessionId !== null && startedAt !== null && !Number.isNaN(startedAt);
  const route = useTrainingRouteData({ sessionId: routeSessionId, enabled: isRunning });

  useTrainingSessionSocket({
    sessionId: activeSessionId,
    onEvent: route.handleTrainingEvent,
  });

  const scheduleTraining = (scenarioId: string, scheduledAt: string) => {
    if (!adminId) throw new Error('훈련 세션을 등록할 관리자 ID가 없습니다.');

    return createSessionMutation.mutateAsync({
      scenarioId,
      body: {
        adminId,
        status: TRAINING_SESSION_STATUS.SCHEDULED,
        startedAt: scheduledAt,
      },
    });
  };

  const startTraining = async () => {
    if (!scenario || !adminId) throw new Error('훈련을 시작할 시나리오 정보가 없습니다.');

    const sessionId =
      scheduledSession?.sessionId ?? (await scheduleTraining(scenario.id, scenario.scheduledAt)).id;

    if (!sessionId) throw new Error('시작할 훈련 세션 ID가 없습니다.');

    const session = await startSessionMutation.mutateAsync(sessionId);
    if (!session.id || !session.startedAt) {
      throw new Error('시작된 훈련 세션 정보가 없습니다.');
    }

    setCreatedSessionId(session.id);
    setCreatedSessionStartedAt(session.startedAt);
  };

  const endTraining = async () => {
    if (!activeSessionId) throw new Error('종료할 훈련 세션 ID가 없습니다.');
    await endSessionMutation.mutateAsync(activeSessionId);
  };

  return {
    route,
    startedAt,
    isRunning,
    areSessionsPending:
      shouldQuerySessions && (isRunningSessionsPending || isScheduledSessionsPending),
    isScheduling: createSessionMutation.isPending,
    isStarting: createSessionMutation.isPending || startSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    scheduleTraining,
    startTraining,
    endTraining,
  };
};
