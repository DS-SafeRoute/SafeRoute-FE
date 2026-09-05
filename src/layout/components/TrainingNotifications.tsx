import { useCallback, useEffect, useRef, useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router';

import { monitoringQueryKeys } from '@pages/trainingAnalysis/api/monitoringQueryKeys';
import { useSessionContextQuery } from '@pages/trainingAnalysis/api/useSessionContextQuery';
import { LIVE_SESSION_POLL_INTERVAL_MS } from '@pages/trainingAnalysis/constants/trainingAnalysis';
import type { TrainingSessionContext } from '@pages/trainingAnalysis/types/trainingAnalysis';

import type { TrainingSessionSummaryResponse } from '@apis/__generated__/data-contracts';
import { scenarioQueryKeys } from '@apis/scenarios/scenarioQueryKeys';
import { getScenario } from '@apis/scenarios/scenariosApi';
import { SCENARIO_STATUS } from '@apis/scenarios/scenarioTypes';
import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { trainingSessionQueryKeys } from '@apis/trainingSessions/trainingSessionQueryKeys';
import { useGetTrainingSessionsQuery } from '@apis/trainingSessions/useGetTrainingSessionsQuery';
import { TRAINING_EVENT_TYPE } from '@apis/trainingSessions/websocket/trainingSessionEvents';
import type {
  TrainingSessionEvent,
  TrainingStatusEventData,
} from '@apis/trainingSessions/websocket/trainingSessionEvents';
import { useTrainingSessionSocket } from '@apis/trainingSessions/websocket/useTrainingSessionSocket';

import useToast from '@components/toast/useToast';

import { getScenarioDetailPath, ROUTES } from '@constants/path';

interface SessionNotificationProps {
  session: TrainingSessionSummaryResponse;
  onEnded: (sessionId: string) => void;
}

// RUNNING 목록에서 사라져도 상세 조회로 실제 종료 상태를 확인할 때까지 구독을 유지한다.
const SessionNotification = ({ session, onEnded }: SessionNotificationProps) => {
  const { show } = useToast();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: context } = useSessionContextQuery(session.sessionId);
  const sessionFailed = context?.status === TRAINING_SESSION_STATUS.FAILED;
  const interrupted =
    context?.status === TRAINING_SESSION_STATUS.STOPPED ||
    context?.status === TRAINING_SESSION_STATUS.CANCELLED;
  const { data: trackedScenario } = useQuery({
    queryKey: scenarioQueryKeys.detail(session.scenarioId ?? ''),
    queryFn: () => getScenario(session.scenarioId as string),
    enabled: Boolean(session.scenarioId),
    staleTime: 0,
    // WebSocket을 놓쳐도 서버의 시나리오 종료 상태로 모든 페이지가 같은 결과에 수렴한다.
    refetchInterval: (query) => {
      const scenarioStatus = query.state.data?.status;
      const scenarioEnded =
        scenarioStatus === SCENARIO_STATUS.COMPLETED ||
        scenarioStatus === SCENARIO_STATUS.ERROR ||
        scenarioStatus === SCENARIO_STATUS.TIMEOUT_FAILED;
      return scenarioEnded ? false : LIVE_SESSION_POLL_INTERVAL_MS;
    },
    refetchIntervalInBackground: true,
  });
  const scenarioStatus = trackedScenario?.status;
  const errored = scenarioStatus === SCENARIO_STATUS.ERROR;
  const timedOut = scenarioStatus === SCENARIO_STATUS.TIMEOUT_FAILED || (sessionFailed && !errored);
  const completed =
    scenarioStatus === SCENARIO_STATUS.COMPLETED ||
    context?.status === TRAINING_SESSION_STATUS.COMPLETED;
  const lastRouteEvent = useRef<string>();
  const isScenarioPage = Boolean(
    session.scenarioId && pathname === getScenarioDetailPath(session.scenarioId),
  );
  const isTrainingAnalysisPage =
    pathname === ROUTES.TRAINING_ANALYSIS || pathname.startsWith(`${ROUTES.TRAINING_ANALYSIS}/`);

  useTrainingSessionSocket({
    sessionId: session.sessionId,
    onEvent: (event) => {
      if (event.eventType === TRAINING_EVENT_TYPE.STATUS_UPDATED) {
        const statusEvent = event as TrainingSessionEvent<TrainingStatusEventData>;
        if (
          statusEvent.data.status !== TRAINING_SESSION_STATUS.RUNNING &&
          statusEvent.data.status !== TRAINING_SESSION_STATUS.SCHEDULED
        ) {
          queryClient.setQueryData<TrainingSessionSummaryResponse[]>(
            trainingSessionQueryKeys.list(TRAINING_SESSION_STATUS.RUNNING),
            (sessions) =>
              sessions?.filter((item) => item.sessionId !== event.sessionId) ?? sessions,
          );
        }
        queryClient.setQueryData<TrainingSessionContext>(
          monitoringQueryKeys.context(event.sessionId),
          (current) =>
            current
              ? {
                  ...current,
                  status: statusEvent.data.status,
                  endedAt: statusEvent.data.endedAt
                    ? Date.parse(statusEvent.data.endedAt)
                    : current.endedAt,
                }
              : current,
        );
        void queryClient.invalidateQueries({
          queryKey: monitoringQueryKeys.context(event.sessionId),
        });
      }
      if (event.eventType !== TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_REQUESTED) return;
      if (lastRouteEvent.current === event.occurredAt) return;
      lastRouteEvent.current = event.occurredAt;
      if (isScenarioPage) return;
      show({
        title: '대피 경로 재탐색 요청이 도착했습니다.',
        description: `${session.scenarioName ?? '진행 중인 훈련'}의 시나리오 화면에서 경로 변경 제안을 확인해 주세요.`,
        variant: 'warning',
        duration: 0,
        actionLabel: '시나리오로 이동',
        onAction: () => {
          if (session.scenarioId) void navigate(getScenarioDetailPath(session.scenarioId));
        },
      });
    },
  });

  useEffect(() => {
    if (
      !context?.status ||
      context.status === TRAINING_SESSION_STATUS.RUNNING ||
      context.status === TRAINING_SESSION_STATUS.SCHEDULED
    )
      return;
    queryClient.setQueryData<TrainingSessionSummaryResponse[]>(
      trainingSessionQueryKeys.list(TRAINING_SESSION_STATUS.RUNNING),
      (sessions) => sessions?.filter((item) => item.sessionId !== session.sessionId) ?? sessions,
    );
    void queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all });
    void queryClient.invalidateQueries({ queryKey: trainingSessionQueryKeys.lists() });
  }, [context?.status, queryClient, session.sessionId]);

  useEffect(() => {
    if (!session.sessionId) return;
    const sessionEnded = Boolean(
      context?.status &&
      context.status !== TRAINING_SESSION_STATUS.RUNNING &&
      context.status !== TRAINING_SESSION_STATUS.SCHEDULED,
    );
    if (!sessionEnded && !timedOut && !errored && !completed) return;

    const scenarioPath = session.scenarioId ? getScenarioDetailPath(session.scenarioId) : undefined;

    // 훈련 분석에서는 시간 초과 후 필요한 결과 입력 화면으로 바로 이어준다.
    if (timedOut && isTrainingAnalysisPage && scenarioPath) {
      void navigate(scenarioPath, {
        replace: true,
        state: { timedOutSessionId: session.sessionId },
      });
      onEnded(session.sessionId);
      return;
    }

    if (errored && isTrainingAnalysisPage) {
      show({ title: '오류로 인해 훈련이 종료되었습니다.', variant: 'error' });
      void navigate(ROUTES.TRAINING_ANALYSIS, { replace: true });
      onEnded(session.sessionId);
      return;
    }

    if (completed && isTrainingAnalysisPage) {
      show({ title: '훈련이 완료되었습니다.', variant: 'success' });
      void navigate(ROUTES.TRAINING_ANALYSIS, { replace: true });
      onEnded(session.sessionId);
      return;
    }

    // 시나리오 화면에서는 오류 안내 또는 결과 입력 모달이 안내한다.
    if (!isScenarioPage && (sessionFailed || errored || interrupted || completed)) {
      show({
        title: timedOut
          ? '최대 훈련 시간 초과로 훈련이 종료되었습니다.'
          : interrupted || errored
            ? '오류로 인해 훈련이 종료되었습니다.'
            : sessionFailed
              ? '훈련이 실패하여 종료되었습니다.'
              : '훈련이 완료되었습니다.',
        description: timedOut
          ? `${session.scenarioName ?? '훈련'} 훈련이 종료되었습니다. 생존 인원을 입력해 분석 보고서를 생성해 주세요.`
          : `${session.scenarioName ?? '훈련'}의 시나리오 화면에서 결과를 확인해 주세요.`,
        variant: timedOut
          ? 'warning'
          : sessionFailed || errored || interrupted
            ? 'error'
            : 'success',
        duration: 10000,
        actionLabel: timedOut && scenarioPath ? '결과 입력하러 가기' : undefined,
        onAction:
          timedOut && scenarioPath
            ? () => {
                void navigate(scenarioPath, {
                  state: { timedOutSessionId: session.sessionId },
                });
              }
            : undefined,
      });
    }
    onEnded(session.sessionId);
  }, [
    context,
    completed,
    errored,
    interrupted,
    isScenarioPage,
    isTrainingAnalysisPage,
    navigate,
    onEnded,
    session,
    sessionFailed,
    scenarioStatus,
    show,
    timedOut,
  ]);

  return null;
};

const TrainingNotifications = () => {
  const [trackedSessions, setTrackedSessions] = useState<TrainingSessionSummaryResponse[]>([]);
  const { data: runningSessions } = useGetTrainingSessionsQuery(TRAINING_SESSION_STATUS.RUNNING, {
    shouldPoll: trackedSessions.length > 0,
  });
  const endedSessionIds = useRef(new Set<string>());

  useEffect(() => {
    if (!runningSessions) return;
    setTrackedSessions((previous) => {
      const additions = runningSessions.filter(
        (session) =>
          session.sessionId &&
          !endedSessionIds.current.has(session.sessionId) &&
          !previous.some((tracked) => tracked.sessionId === session.sessionId),
      );
      return additions.length ? [...previous, ...additions] : previous;
    });
  }, [runningSessions]);

  const handleEnded = useCallback((sessionId: string) => {
    endedSessionIds.current.add(sessionId);
    setTrackedSessions((previous) => previous.filter((session) => session.sessionId !== sessionId));
  }, []);

  return trackedSessions.map((session) => (
    <SessionNotification key={session.sessionId} session={session} onEnded={handleEnded} />
  ));
};

export default TrainingNotifications;
