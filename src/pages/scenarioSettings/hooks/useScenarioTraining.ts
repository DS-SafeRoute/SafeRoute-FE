import { useCallback, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { Scenario } from '@pages/scenarioSettings/types/scenarioList';
import { SCENARIO_STATUS } from '@pages/scenarioSettings/types/scenarioList';

import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { currentTrainingRouteQueryOptions } from '@apis/trainingSessions/useGetCurrentTrainingRouteQuery';
import { useGetTrainingSessionsQuery } from '@apis/trainingSessions/useGetTrainingSessionsQuery';
import {
  useCreateTrainingSessionMutation,
  useEndTrainingSessionMutation,
  useStartTrainingSessionMutation,
} from '@apis/trainingSessions/useTrainingSessionMutations';
import { TRAINING_EVENT_TYPE } from '@apis/trainingSessions/websocket/trainingSessionEvents';
import type {
  TrainingSessionEvent,
  TrainingStatusEventData,
} from '@apis/trainingSessions/websocket/trainingSessionEvents';
import { useTrainingSessionSocket } from '@apis/trainingSessions/websocket/useTrainingSessionSocket';

import { useTrainingRouteData } from './useTrainingRouteData';

interface UseScenarioTrainingParams {
  scenario?: Scenario;
  adminId?: string;
}

export const useScenarioTraining = ({ scenario, adminId }: UseScenarioTrainingParams) => {
  const queryClient = useQueryClient();
  // 목록 쿼리가 갱신되기 전에도 시작 직후 화면을 전환할 수 있도록 시작 응답을 임시 보관
  const [startedSession, setStartedSession] = useState<{
    id: string;
    startedAt: string;
  } | null>(null);
  // 대피 설정 직후 생성한 SCHEDULED 세션을 목록 재조회 전에도 경로 미리보기에 사용
  const [preparedSessionId, setPreparedSessionId] = useState<string | null>(null);
  // 서버가 최대 진행 시간 초과로 FAILED 처리했을 때 한 번 안내하기 위한 이벤트 시각
  const [timeLimitExceededAt, setTimeLimitExceededAt] = useState<string | null>(null);

  // 훈련 세션 예약·시작·종료
  const createSessionMutation = useCreateTrainingSessionMutation();
  const startSessionMutation = useStartTrainingSessionMutation();
  const endSessionMutation = useEndTrainingSessionMutation();

  // 시작 가능한 시나리오에서만 실행 중·예약 세션 조회
  const shouldQuerySessions =
    scenario?.status === SCENARIO_STATUS.READY || scenario?.status === SCENARIO_STATUS.IN_PROGRESS;
  const shouldPollRunningSessions =
    scenario?.status === SCENARIO_STATUS.IN_PROGRESS || startedSession !== null;
  const { data: runningSessions = [], isPending: isRunningSessionsPending } =
    useGetTrainingSessionsQuery(TRAINING_SESSION_STATUS.RUNNING, {
      enabled: shouldQuerySessions,
      shouldPoll: shouldPollRunningSessions,
    });
  const { data: scheduledSessions = [], isPending: isScheduledSessionsPending } =
    useGetTrainingSessionsQuery(TRAINING_SESSION_STATUS.SCHEDULED, {
      enabled: shouldQuerySessions,
      shouldPoll: false,
    });

  // 최신 응답의 scenarioId로 현재 시나리오 세션을 식별
  const runningSession = runningSessions.find((session) => session.scenarioId === scenario?.id);
  const scheduledSession = scheduledSessions.find((session) => session.scenarioId === scenario?.id);

  // 시작 직후에는 API 응답을 사용하고, 재진입 시에는 조회된 실행 세션 사용
  const activeSessionId = startedSession?.id ?? runningSession?.sessionId ?? null;
  const scheduledSessionId = preparedSessionId ?? scheduledSession?.sessionId ?? null;
  const activeStartedAt = startedSession?.startedAt ?? runningSession?.startedAt ?? null;
  const startedAt = activeStartedAt ? Date.parse(activeStartedAt) : null;
  const isRunning = activeSessionId !== null && startedAt !== null && !Number.isNaN(startedAt);

  // SCHEDULED부터 현재 경로를 조회하고, 실시간 이벤트는 RUNNING일 때만 연결
  const route = useTrainingRouteData({
    sessionId: activeSessionId ?? scheduledSessionId,
    enabled: Boolean(activeSessionId ?? scheduledSessionId),
    liveUpdatesEnabled: isRunning,
  });
  const handleRouteTrainingEvent = route.handleTrainingEvent;

  const clearLocalSessionState = useCallback(() => {
    setStartedSession(null);
    setPreparedSessionId(null);
  }, []);

  const handleTrainingEvent = useCallback(
    (event: TrainingSessionEvent) => {
      handleRouteTrainingEvent(event);
      if (event.eventType !== TRAINING_EVENT_TYPE.STATUS_UPDATED) return;

      const statusEvent = event as TrainingSessionEvent<TrainingStatusEventData>;
      if (statusEvent.data.status === TRAINING_SESSION_STATUS.COMPLETED) {
        clearLocalSessionState();
        return;
      }

      if (statusEvent.data.status !== TRAINING_SESSION_STATUS.FAILED) return;

      clearLocalSessionState();
      setTimeLimitExceededAt(statusEvent.data.endedAt ?? event.occurredAt);
    },
    [clearLocalSessionState, handleRouteTrainingEvent],
  );

  useTrainingSessionSocket({ sessionId: activeSessionId, onEvent: handleTrainingEvent });

  // 시나리오 생성 직후 또는 예약 세션이 없을 때 훈련 일정 등록
  const scheduleTraining = async (scenarioId: string) => {
    if (!adminId) throw new Error('훈련 세션을 등록할 관리자 ID가 없습니다.');

    const session = await createSessionMutation.mutateAsync({
      scenarioId,
      body: { adminId },
    });
    if (!session.id) throw new Error('생성된 훈련 세션 ID가 없습니다.');
    setPreparedSessionId(session.id);
    return session;
  };

  // 이미 생성된 예약 세션은 재사용하고 없을 때만 생성
  const ensureScheduledSession = async (scenarioId: string) => {
    if (scheduledSessionId) return scheduledSessionId;
    const session = await scheduleTraining(scenarioId);
    return session.id;
  };

  // 서버가 기본 경로를 반환하는지 마지막으로 검증한 뒤 훈련 시작
  const startTraining = async () => {
    if (!scenario || !adminId) throw new Error('훈련을 시작할 시나리오 정보가 없습니다.');

    const sessionId = await ensureScheduledSession(scenario.id);

    if (!sessionId) throw new Error('시작할 훈련 세션 ID가 없습니다.');

    const currentRoute = await queryClient.fetchQuery({
      ...currentTrainingRouteQueryOptions(sessionId),
      staleTime: 0,
    });
    if (!currentRoute.path?.length) {
      throw new Error('시작 지점에서 출구까지 연결된 기본 경로가 없습니다.');
    }

    const session = await startSessionMutation.mutateAsync(sessionId);
    if (!session.id || !session.startedAt) {
      throw new Error('시작된 훈련 세션 정보가 없습니다.');
    }

    setStartedSession({ id: session.id, startedAt: session.startedAt });
    setTimeLimitExceededAt(null);
  };

  // 현재 실행 중인 훈련 종료
  const endTraining = async () => {
    if (!activeSessionId) throw new Error('종료할 훈련 세션 ID가 없습니다.');
    await endSessionMutation.mutateAsync(activeSessionId);
    clearLocalSessionState();
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
    timeLimitExceededAt,
    ensureScheduledSession,
    startTraining,
    endTraining,
  };
};
