import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { TRAINING_EVENT_TYPE } from '@apis/trainingSessions/websocket/trainingSessionEvents';
import type { TrainingSessionEvent } from '@apis/trainingSessions/websocket/trainingSessionEvents';

import { evacuationRouteQueryKeys } from '../api/evacuationRoutes/evacuationRouteQueries';
import {
  routeRecalculationQueryKeys,
  useApproveRouteRecalculationMutation,
  useRejectRouteRecalculationMutation,
  useRouteRecalculationDetailQuery,
  useRouteRecalculationsQuery,
} from '../api/routeRecalculations/routeRecalculationQueries';
import {
  formatRecalculationTime,
  formatRouteSegment,
  formatRouteProposal,
  getLatestRecalculation,
} from '../utils/trainingRoutes';

import type { PreviewMetric } from '../types/scenarioSettings';

interface UseTrainingRouteDataParams {
  sessionId?: string | null;
  enabled: boolean;
  cctvMetricValue: string;
  lightMetricValue: string;
}

export const useTrainingRouteData = ({
  sessionId,
  enabled,
  cctvMetricValue,
  lightMetricValue,
}: UseTrainingRouteDataParams) => {
  const queryClient = useQueryClient();
  const shouldFetch = enabled && Boolean(sessionId);
  const recalculationsQuery = useRouteRecalculationsQuery(
    sessionId ? { trainingSessionId: sessionId } : undefined,
    shouldFetch,
  );
  const recalculations = recalculationsQuery.data ?? [];
  const pendingRecalculation = getLatestRecalculation(
    recalculations.filter((item) => item.status === 'PENDING'),
  );
  const latestRecalculation = getLatestRecalculation(recalculations);
  const detailQuery = useRouteRecalculationDetailQuery(
    pendingRecalculation?.recalculationId,
    shouldFetch,
  );
  const approveMutation = useApproveRouteRecalculationMutation();
  const rejectMutation = useRejectRouteRecalculationMutation();
  const routeProposal = formatRouteProposal(detailQuery.data);
  const liveMetrics: PreviewMetric[] = [
    {
      id: 'route-recalculation',
      label: '마지막 경로 재산출',
      value: formatRecalculationTime(latestRecalculation?.requestedAt),
    },
    {
      id: 'cctv',
      label: '감지 CCTV',
      value: cctvMetricValue,
    },
    {
      id: 'iot',
      label: '활성 IoT 유도등',
      value: lightMetricValue,
    },
  ];

  const handleTrainingEvent = useCallback(
    (event: TrainingSessionEvent) => {
      if (
        event.eventType === TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_REQUESTED ||
        event.eventType === TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_REJECTED ||
        event.eventType === TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_CANCELLED
      ) {
        void queryClient.invalidateQueries({ queryKey: routeRecalculationQueryKeys.all });
      }

      if (event.eventType === TRAINING_EVENT_TYPE.EVACUATION_ROUTE_UPDATED) {
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: routeRecalculationQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: evacuationRouteQueryKeys.all }),
        ]);
      }
    },
    [queryClient],
  );

  return {
    currentRoute: detailQuery.data ? formatRouteSegment(detailQuery.data.previousRoute) : null,
    routeProposal,
    liveMetrics,
    isRouteDecisionPending: approveMutation.isPending || rejectMutation.isPending,
    approveRouteProposal: () => {
      if (!pendingRecalculation?.recalculationId) return Promise.resolve(undefined);
      return approveMutation.mutateAsync(pendingRecalculation.recalculationId);
    },
    rejectRouteProposal: () => {
      if (!pendingRecalculation?.recalculationId) return Promise.resolve(undefined);
      return rejectMutation.mutateAsync({
        recalculationId: pendingRecalculation.recalculationId,
      });
    },
    handleTrainingEvent,
  };
};
