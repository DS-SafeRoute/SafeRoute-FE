import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  routeRecalculationQueryKeys,
  useApproveRouteRecalculationMutation,
  useRejectRouteRecalculationMutation,
  useRouteRecalculationDetailQuery,
  useRouteRecalculationsQuery,
} from '@pages/scenarioSettings/api/routeRecalculations/routeRecalculationQueries';
import type { RoutePoint } from '@pages/scenarioSettings/types/scenarioSettings';
import {
  formatCurrentRoute,
  formatRouteProposal,
  getLatestRecalculation,
} from '@pages/scenarioSettings/utils/trainingRoutes';

import type { CurrentRouteResponse } from '@apis/__generated__/data-contracts';
import { floorQueryKeys } from '@apis/floors/floorQueries';
import { fireZoneQueryKeys } from '@apis/scenarios/fireZoneQueries';
import { trainingSessionQueryKeys } from '@apis/trainingSessions/trainingSessionQueryKeys';
import { useGetCurrentTrainingRouteQuery } from '@apis/trainingSessions/useGetCurrentTrainingRouteQuery';
import { TRAINING_EVENT_TYPE } from '@apis/trainingSessions/websocket/trainingSessionEvents';
import type { TrainingSessionEvent } from '@apis/trainingSessions/websocket/trainingSessionEvents';

interface UseTrainingRouteDataParams {
  sessionId?: string | null;
  enabled: boolean;
  liveUpdatesEnabled: boolean;
}

const getCurrentRouteMessage = (
  route: CurrentRouteResponse | undefined,
  isPending: boolean,
  isError: boolean,
) => {
  if (isPending) return '현재 대피 경로를 불러오는 중...';
  if (isError) return '현재 대피 경로를 불러오지 못했습니다.';
  return formatCurrentRoute(route);
};

const hasRouteCoordinates = (point: { x?: number; y?: number }): point is RoutePoint =>
  point.x !== undefined && point.y !== undefined;

export const useTrainingRouteData = ({
  sessionId,
  enabled,
  liveUpdatesEnabled,
}: UseTrainingRouteDataParams) => {
  const queryClient = useQueryClient();
  const shouldFetch = enabled && Boolean(sessionId);
  const currentRouteQuery = useGetCurrentTrainingRouteQuery(sessionId, shouldFetch);
  const recalculationsQuery = useRouteRecalculationsQuery(
    sessionId ? { trainingSessionId: sessionId } : undefined,
    shouldFetch && liveUpdatesEnabled,
  );
  const recalculations = recalculationsQuery.data ?? [];
  const pendingRecalculation = getLatestRecalculation(
    recalculations.filter((item) => item.status === 'PENDING'),
  );
  const detailQuery = useRouteRecalculationDetailQuery(
    pendingRecalculation?.recalculationId,
    shouldFetch && liveUpdatesEnabled,
  );
  const approveMutation = useApproveRouteRecalculationMutation();
  const rejectMutation = useRejectRouteRecalculationMutation();
  const routeProposal = formatRouteProposal(detailQuery.data);
  const currentRouteMessage = getCurrentRouteMessage(
    currentRouteQuery.data,
    currentRouteQuery.isPending,
    currentRouteQuery.isError,
  );

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
    currentRouteMessage,
    routeFloorId: currentRouteQuery.data?.floorId ?? null,
    // 경로 계산은 서버 책임이다. current-route가 준 좌표만 이어서 도면에 표시한다.
    routePoints: currentRouteQuery.data?.path?.filter(hasRouteCoordinates) ?? [],
    routeProposal,
    isApplyingRouteProposal: approveMutation.isPending,
    isRejectingRouteProposal: rejectMutation.isPending,
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
