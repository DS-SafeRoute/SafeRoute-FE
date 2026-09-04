import { useQueries } from '@tanstack/react-query';

import {
  floorCctvsQueryOptions,
  floorLightsQueryOptions,
  useBuildingFloorsQuery,
} from '@apis/floors/floorQueries';

export interface BuildingDeviceStats {
  cctvTotal: number;
  cctvOnline: number;
  iotTotal: number;
  iotOnline: number;
  isLoading: boolean;
}

// 건물 단위 CCTV/유도등 집계 API가 아직 없어서, 층 목록 → 층별 CCTV·유도등 목록을 합산해
// 실제 등록 대수를 만든다. online은 enabled(사용 설정된) 기기 수 기준.
// (스쿨 규모라 건물 × 층 쿼리 수가 감당 가능한 수준이고, react-query 캐시로 중복 호출은 합쳐짐)
export const useBuildingDeviceStatsQuery = (buildingId: string): BuildingDeviceStats => {
  const floorsQuery = useBuildingFloorsQuery(buildingId);
  const floorIds = (floorsQuery.data ?? []).map((floor) => floor.id);

  const cctvQueries = useQueries({
    queries: floorIds.map((floorId) => floorCctvsQueryOptions(floorId)),
  });
  const lightQueries = useQueries({
    queries: floorIds.map((floorId) => floorLightsQueryOptions(floorId)),
  });

  const cctvs = cctvQueries.flatMap((query) => query.data ?? []);
  const lights = lightQueries.flatMap((query) => query.data ?? []);

  return {
    cctvTotal: cctvs.length,
    cctvOnline: cctvs.filter((cctv) => cctv.enabled).length,
    iotTotal: lights.length,
    iotOnline: lights.filter((light) => light.enabled).length,
    isLoading:
      floorsQuery.isLoading ||
      cctvQueries.some((query) => query.isLoading) ||
      lightQueries.some((query) => query.isLoading),
  };
};
