import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { floorQueryKeys } from '@apis/floors/floorQueries';
import { trainingSessionQueryKeys } from '@apis/trainingSessions/trainingSessionQueryKeys';
import { useGetCurrentTrainingRouteQuery } from '@apis/trainingSessions/useGetCurrentTrainingRouteQuery';
import { TRAINING_EVENT_TYPE } from '@apis/trainingSessions/websocket/trainingSessionEvents';
import type { TrainingSessionEvent } from '@apis/trainingSessions/websocket/trainingSessionEvents';

import { fireZoneQueryKeys } from '../api/fireZones/fireZoneQueries';
import {
  routeRecalculationQueryKeys,
  useApproveRouteRecalculationMutation,
  useRejectRouteRecalculationMutation,
  useRouteRecalculationDetailQuery,
  useRouteRecalculationsQuery,
} from '../api/routeRecalculations/routeRecalculationQueries';
import {
  formatCurrentRoute,
  formatRouteProposal,
  getLatestRecalculation,
} from '../utils/trainingRoutes';

interface UseTrainingRouteDataParams {
  sessionId?: string | null;
  enabled: boolean;
}

export const useTrainingRouteData = ({ sessionId, enabled }: UseTrainingRouteDataParams) => {
  const queryClient = useQueryClient();
  const shouldFetch = enabled && Boolean(sessionId);
  const currentRouteQuery = useGetCurrentTrainingRouteQuery(sessionId);
  const recalculationsQuery = useRouteRecalculationsQuery(
    sessionId ? { trainingSessionId: sessionId } : undefined,
    shouldFetch,
  );
  const recalculations = recalculationsQuery.data ?? [];
  const pendingRecalculation = getLatestRecalculation(
    recalculations.filter((item) => item.status === 'PENDING'),
  );
  const detailQuery = useRouteRecalculationDetailQuery(
    pendingRecalculation?.recalculationId,
    shouldFetch,
  );
  const approveMutation = useApproveRouteRecalculationMutation();
  const rejectMutation = useRejectRouteRecalculationMutation();
  const routeProposal = formatRouteProposal(detailQuery.data);

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
          queryClient.invalidateQueries({ queryKey: trainingSessionQueryKeys.currentRoutes() }),
        ]);
      }

      if (event.eventType === TRAINING_EVENT_TYPE.FIRE_SPREAD_UPDATED) {
        void queryClient.invalidateQueries({ queryKey: fireZoneQueryKeys.lists() });
      }

      if (event.eventType === TRAINING_EVENT_TYPE.IOT_LIGHT_STATUS_UPDATED) {
        void queryClient.invalidateQueries({ queryKey: floorQueryKeys.lights() });
      }
    },
    [queryClient],
  );

  return {
    currentRouteMessage: currentRouteQuery.isPending
      ? '현재 대피 경로를 불러오는 중...'
      : currentRouteQuery.isError
        ? '현재 대피 경로를 불러오지 못했습니다.'
        : formatCurrentRoute(currentRouteQuery.data),
    routeFloorId: currentRouteQuery.data?.floorId ?? null,
    routeNodeIds:
      currentRouteQuery.data?.path
        ?.map((node) => node.nodeId)
        .filter((nodeId): nodeId is string => Boolean(nodeId)) ?? [],
    routeProposal,
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
