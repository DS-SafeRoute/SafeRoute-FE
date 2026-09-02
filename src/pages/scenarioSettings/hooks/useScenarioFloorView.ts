import type { PreviewMetric } from '@pages/scenarioSettings/types/scenarioSettings';

import type { FloorGridCell } from '@apis/floors/floorGridApi';
import {
  useFloorCctvsQuery,
  useFloorGraphQuery,
  useFloorGridCellsQuery,
  useFloorImageUrlQuery,
  useFloorLightsQuery,
} from '@apis/floors/floorQueries';
import type { FloorGraph } from '@apis/floors/mapGraphApi';
import {
  useScenarioFireOriginQuery,
  useScenarioFireZonesQuery,
} from '@apis/scenarios/fireZoneQueries';

interface UseScenarioFloorViewParams {
  scenarioId?: string;
  buildingId: string;
  isRunning: boolean;
  routeFloorId?: string | null;
  routeNodeIds: readonly string[];
}

export interface ScenarioFloorMapView {
  imageUrl?: string | null;
  graph?: FloorGraph | null;
  gridCells: readonly FloorGridCell[];
  routeNodeIds: readonly string[];
  fireCellIds: readonly string[];
  originCellId?: string | null;
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

export const useScenarioFloorView = ({
  scenarioId,
  buildingId,
  isRunning,
  routeFloorId,
  routeNodeIds,
}: UseScenarioFloorViewParams) => {
  const fireOriginQuery = useScenarioFireOriginQuery(scenarioId);
  const fireZonesQuery = useScenarioFireZonesQuery(scenarioId, isRunning);
  const fireOrigin = fireOriginQuery.data?.[0];
  const displayedFireZones = isRunning ? (fireZonesQuery.data ?? []) : (fireOriginQuery.data ?? []);
  const floorId = routeFloorId ?? fireOrigin?.floorId ?? displayedFireZones[0]?.floorId;
  const floorImageQuery = useFloorImageUrlQuery(buildingId, floorId);
  const floorGraphQuery = useFloorGraphQuery(floorId);
  const floorGridQuery = useFloorGridCellsQuery(floorId);
  const floorCctvsQuery = useFloorCctvsQuery(floorId);
  const floorLightsQuery = useFloorLightsQuery(floorId);
  const isFireZonePending =
    Boolean(scenarioId) && (fireOriginQuery.isPending || (isRunning && fireZonesQuery.isPending));

  const cctvMetricValue = getMetricValue({
    count: floorCctvsQuery.data?.length,
    suffix: '대',
    isPending: isFireZonePending || (Boolean(floorId) && floorCctvsQuery.isPending),
    isUnavailable: !floorId || fireOriginQuery.isError || floorCctvsQuery.isError,
  });
  const activeLightCount = floorLightsQuery.data?.filter(
    (light) => light.enabled && light.guidanceConfigured,
  ).length;
  const lightMetricValue = getMetricValue({
    count: activeLightCount,
    suffix: '개',
    isPending: isFireZonePending || (Boolean(floorId) && floorLightsQuery.isPending),
    isUnavailable: !floorId || fireOriginQuery.isError || floorLightsQuery.isError,
  });
  const previewMetrics: PreviewMetric[] = [
    { id: 'cctv', label: '감지 CCTV', value: cctvMetricValue },
    { id: 'iot', label: '활성 IoT 유도등', value: lightMetricValue },
  ];
  const isFloorVisualPending =
    Boolean(floorId) &&
    (floorImageQuery.isPending || floorGraphQuery.isPending || floorGridQuery.isPending);

  // 발화점 등록(POST /scenarios/{scenarioId}/fire-zones)이 백엔드에서 제거되면서(팀 전달사항,
  // 2026-09-03) 도면관리상세 쪽 등록 화면도 같이 없앴음 — "도면 관리에서 지정하세요"라는 예전
  // 안내는 이제 실제로 갈 곳이 없는 말이라 지움. evacuation-setup 기반의 새 등록 플로우가
  // 이 페이지에 생기면 그 화면을 가리키도록 다시 채워야 함
  let statusMessage: string | undefined;
  if (!scenarioId) {
    statusMessage = '시나리오 등록 후 최초 발화점을 지정해 주세요.';
  } else if (isFireZonePending) {
    statusMessage = '발화점 정보를 불러오는 중...';
  } else if (fireOriginQuery.isError || (isRunning && fireZonesQuery.isError)) {
    statusMessage = '화재구역 정보를 불러오지 못했습니다.';
  } else if (!floorId) {
    statusMessage = '최초 발화점을 지정해 주세요.';
  } else if (isFloorVisualPending) {
    statusMessage = '도면을 불러오는 중...';
  } else if (floorImageQuery.isError) {
    statusMessage = '도면 이미지를 불러오지 못했습니다.';
  } else if (floorGraphQuery.isError) {
    statusMessage = '맵 그래프를 불러오지 못했습니다.';
  } else if (floorGridQuery.isError) {
    statusMessage = '격자 정보를 불러오지 못했습니다.';
  } else if (floorGridQuery.data?.length === 0) {
    statusMessage = '등록된 격자 정보가 없습니다.';
  }

  return {
    floorMap: {
      imageUrl: floorImageQuery.data?.imageUrl,
      graph: floorGraphQuery.data,
      gridCells: floorGridQuery.data ?? [],
      routeNodeIds,
      fireCellIds: displayedFireZones
        .filter((zone) => zone.floorId === floorId)
        .map((zone) => zone.gridCellId),
      originCellId: fireOrigin?.gridCellId,
      statusMessage,
    } satisfies ScenarioFloorMapView,
    previewMetrics,
    hasFireOrigin: Boolean(fireOrigin),
    isFireOriginPending: fireOriginQuery.isPending,
    isFireOriginError: fireOriginQuery.isError,
  };
};
