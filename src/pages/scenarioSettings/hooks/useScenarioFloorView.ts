import { useMemo } from 'react';

import type { FloorGridCell } from '@apis/floors/floorGridApi';
import {
  useFloorCctvsQuery,
  useFloorGridCellsQuery,
  useFloorImageUrlQuery,
  useFloorLightsQuery,
} from '@apis/floors/floorQueries';
import type { FloorGraph } from '@apis/floors/mapGraphApi';

import { useEvacuationRouteQuery } from '../api/evacuationRoutes/evacuationRouteQueries';
import { useScenarioFloorQuery } from '../api/floorContext/scenarioFloorQueries';
import { formatEvacuationRoute } from '../utils/trainingRoutes';

import type { PreviewMetric } from '../types/scenarioSettings';

interface UseScenarioFloorViewParams {
  buildingId: string;
  startNodeId: string;
}

export interface ScenarioFloorMapView {
  imageUrl?: string | null;
  graph?: FloorGraph | null;
  gridCells: readonly FloorGridCell[];
  routeNodeIds: readonly string[];
  statusMessage?: string;
}

interface MetricValueParams {
  count?: number;
  suffix: string;
  isPending: boolean;
  isUnavailable: boolean;
}

const getMetricValue = ({ count, suffix, isPending, isUnavailable }: MetricValueParams) => {
  if (isPending) return '불러오는 중...';
  if (isUnavailable || count === undefined) return '정보 없음';
  return `${count}${suffix}`;
};

export const useScenarioFloorView = ({ buildingId, startNodeId }: UseScenarioFloorViewParams) => {
  const floorParams = buildingId && startNodeId ? { buildingId, startNodeId } : undefined;
  const scenarioFloorQuery = useScenarioFloorQuery(floorParams, Boolean(floorParams));
  const floorId = scenarioFloorQuery.data?.floor.id;
  const hasFloorImage = Boolean(scenarioFloorQuery.data?.floor.mapImageKey);
  const floorImageQuery = useFloorImageUrlQuery(
    buildingId,
    floorId,
    Boolean(floorId && hasFloorImage),
  );
  const floorGridQuery = useFloorGridCellsQuery(floorId, Boolean(floorId));
  const floorCctvsQuery = useFloorCctvsQuery(floorId, Boolean(floorId));
  const floorLightsQuery = useFloorLightsQuery(floorId, Boolean(floorId));
  const evacuationRouteQuery = useEvacuationRouteQuery(
    floorId && startNodeId ? { floorId, startNodeId } : undefined,
    Boolean(floorId && startNodeId),
  );

  const routeNodeIds = useMemo(
    () =>
      evacuationRouteQuery.data?.path
        ?.map((node) => node.id)
        .filter((nodeId): nodeId is string => Boolean(nodeId)) ?? [],
    [evacuationRouteQuery.data],
  );
  const isResolvingFloor = Boolean(floorParams) && scenarioFloorQuery.isPending;
  const cctvMetricValue = getMetricValue({
    count: floorCctvsQuery.data?.length,
    suffix: '대',
    isPending: isResolvingFloor || (Boolean(floorId) && floorCctvsQuery.isPending),
    isUnavailable: !floorId || scenarioFloorQuery.isError || floorCctvsQuery.isError,
  });
  const activeLightCount = floorLightsQuery.data?.filter(
    (light) => light.enabled && light.guidanceConfigured,
  ).length;
  const lightMetricValue = getMetricValue({
    count: activeLightCount,
    suffix: '개',
    isPending: isResolvingFloor || (Boolean(floorId) && floorLightsQuery.isPending),
    isUnavailable: !floorId || scenarioFloorQuery.isError || floorLightsQuery.isError,
  });
  const previewMetrics: PreviewMetric[] = [
    { id: 'cctv', label: '감지 CCTV', value: cctvMetricValue },
    { id: 'iot', label: '활성 IoT 유도등', value: lightMetricValue },
  ];
  const isFloorVisualPending =
    isResolvingFloor ||
    (Boolean(floorId) &&
      ((hasFloorImage && floorImageQuery.isPending) ||
        floorGridQuery.isPending ||
        evacuationRouteQuery.isPending));

  let statusMessage: string | undefined;
  if (!floorParams) {
    statusMessage = '대피 시작 위치가 연결되면 도면이 표시됩니다.';
  } else if (isFloorVisualPending) {
    statusMessage = '도면을 불러오는 중...';
  } else if (scenarioFloorQuery.isError) {
    statusMessage = '도면 정보를 불러오지 못했습니다.';
  } else if (!scenarioFloorQuery.data) {
    statusMessage = '대피 시작 노드가 포함된 층을 찾지 못했습니다.';
  } else if (floorImageQuery.isError) {
    statusMessage = '도면 이미지를 불러오지 못했습니다.';
  } else if (floorGridQuery.isError) {
    statusMessage = '격자 정보를 불러오지 못했습니다.';
  } else if (floorGridQuery.data?.length === 0) {
    statusMessage = '등록된 격자 정보가 없습니다.';
  }

  const initialRouteMessage =
    isResolvingFloor || (Boolean(floorId) && evacuationRouteQuery.isPending)
      ? '현재 대피 경로를 불러오는 중...'
      : evacuationRouteQuery.isError
        ? '현재 대피 경로를 불러오지 못했습니다.'
        : formatEvacuationRoute(evacuationRouteQuery.data);

  return {
    floorMap: {
      imageUrl: floorImageQuery.data?.imageUrl,
      graph: scenarioFloorQuery.data?.graph,
      gridCells: floorGridQuery.data ?? [],
      routeNodeIds,
      statusMessage,
    } satisfies ScenarioFloorMapView,
    previewMetrics,
    cctvMetricValue,
    lightMetricValue,
    initialRouteMessage,
  };
};
