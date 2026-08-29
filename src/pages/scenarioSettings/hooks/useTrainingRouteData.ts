import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { TRAINING_EVENT_TYPE } from '@apis/trainingSessions/websocket/trainingSessionEvents';
import type { TrainingSessionEvent } from '@apis/trainingSessions/websocket/trainingSessionEvents';

import {
  evacuationRouteQueryKeys,
  useEvacuationRouteQuery,
} from '../api/evacuationRoutes/evacuationRouteQueries';
import { useBuildingFloorsQuery, useFloorGraphQuery } from '../api/mapGraph/mapGraphQueries';
import {
  routeRecalculationQueryKeys,
  useApproveRouteRecalculationMutation,
  useRejectRouteRecalculationMutation,
  useRouteRecalculationDetailQuery,
  useRouteRecalculationsQuery,
} from '../api/routeRecalculations/routeRecalculationQueries';
import {
  findRouteStartNode,
  formatEvacuationRoute,
  formatRecalculationTime,
  formatRouteProposal,
  getLatestRecalculation,
  selectTrainingFloor,
} from '../utils/trainingRoutes';

import type { PreviewMetric } from '../types/scenarioSettings';

interface UseTrainingRouteDataParams {
  buildingId?: string;
  sessionId?: string | null;
  fireOrigin: string;
  enabled: boolean;
}

export const useTrainingRouteData = ({
  buildingId,
  sessionId,
  fireOrigin,
  enabled,
}: UseTrainingRouteDataParams) => {
  const queryClient = useQueryClient();
  const shouldFetch = enabled && Boolean(buildingId && sessionId);
  const floorsQuery = useBuildingFloorsQuery(buildingId, shouldFetch);
  const trainingFloor = selectTrainingFloor(floorsQuery.data ?? [], fireOrigin);
  const graphQuery = useFloorGraphQuery(trainingFloor?.id, shouldFetch);
  const graphNodes = graphQuery.data?.nodes ?? [];
  const startNode = findRouteStartNode(graphNodes, fireOrigin);
  const routeQuery = useEvacuationRouteQuery(
    trainingFloor?.id && startNode?.id
      ? { floorId: trainingFloor.id, startNodeId: startNode.id }
      : undefined,
    shouldFetch,
  );
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
  const routeProposal = formatRouteProposal(detailQuery.data, graphNodes);
  const isRouteLoading =
    shouldFetch &&
    (floorsQuery.isPending ||
      (Boolean(trainingFloor?.id) && graphQuery.isPending) ||
      (Boolean(startNode?.id) && routeQuery.isPending));
  const liveMetrics: PreviewMetric[] = [
    {
      id: 'route-recalculation',
      label: '마지막 경로 재산출',
      value: formatRecalculationTime(latestRecalculation?.requestedAt),
    },
    {
      id: 'cctv',
      label: '감지 CCTV',
      value: '—',
    },
    {
      id: 'iot',
      label: '활성 IoT 유도등',
      value: '—',
    },
    {
      id: 'evacuation',
      label: '잔여 예상 대피 시간',
      value: '—',
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

  const hasFloorPlanError = floorsQuery.isError || graphQuery.isError || routeQuery.isError;
  const floorPlanMessage = hasFloorPlanError
    ? '도면 또는 대피 경로 정보를 불러오지 못했습니다.'
    : trainingFloor
      ? startNode
        ? undefined
        : '발화 위치에 해당하는 시작 노드를 찾을 수 없습니다.'
      : '발화 위치에 해당하는 층 정보를 찾을 수 없습니다.';

  return {
    floorGraph: graphQuery.data,
    evacuationRoute: routeQuery.data,
    currentRoute: isRouteLoading
      ? '현재 대피 경로를 불러오는 중...'
      : formatEvacuationRoute(routeQuery.data),
    routeProposal,
    liveMetrics,
    isFloorPlanLoading: isRouteLoading,
    floorPlanMessage: shouldFetch ? floorPlanMessage : undefined,
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
