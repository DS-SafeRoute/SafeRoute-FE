import { queryOptions, useQuery } from '@tanstack/react-query';

import { getFloorCctvs } from './cctvApi';
import { getFloorGridCells } from './floorGridApi';
import { getBuildingFloors, getFloorImageUrl } from './floorsApi';
import { getFloorLights } from './iotLightsApi';
import { getFloorGraph } from './mapGraphApi';
import { getFloorUserZones, getUserZoneDetail } from './userZoneApi';

import type { UserZone } from './userZoneApi';

export const floorQueryKeys = {
  all: ['floors'] as const,
  lists: () => [...floorQueryKeys.all, 'list'] as const,
  list: (buildingId?: string) => [...floorQueryKeys.lists(), buildingId] as const,
  details: () => [...floorQueryKeys.all, 'detail'] as const,
  detail: (buildingId?: string, floorId?: string) =>
    [...floorQueryKeys.details(), buildingId, floorId] as const,
  images: () => [...floorQueryKeys.all, 'image'] as const,
  image: (buildingId?: string, floorId?: string) =>
    [...floorQueryKeys.images(), buildingId, floorId] as const,
  graphs: () => [...floorQueryKeys.all, 'graph'] as const,
  graph: (floorId?: string) => [...floorQueryKeys.graphs(), floorId] as const,
  grids: () => [...floorQueryKeys.all, 'grid'] as const,
  grid: (floorId?: string) => [...floorQueryKeys.grids(), floorId] as const,
  cctvs: () => [...floorQueryKeys.all, 'cctv'] as const,
  cctv: (floorId?: string) => [...floorQueryKeys.cctvs(), floorId] as const,
  lights: () => [...floorQueryKeys.all, 'light'] as const,
  light: (floorId?: string) => [...floorQueryKeys.lights(), floorId] as const,
  zones: () => [...floorQueryKeys.all, 'zone'] as const,
  zone: (floorId?: string) => [...floorQueryKeys.zones(), floorId] as const,
};

// 목록 API가 이름만 내려줘서, 화면에 그리려면 구역마다 셀 상세를 따로 조회해 합쳐야 함
export interface UserZoneWithCells extends UserZone {
  cellIds: string[];
}

export const buildingFloorsQueryOptions = (buildingId?: string) =>
  queryOptions({
    queryKey: floorQueryKeys.list(buildingId),
    queryFn: ({ signal }) => {
      if (!buildingId) throw new Error('층 목록 조회에 필요한 건물 ID가 없습니다.');
      return getBuildingFloors(buildingId, signal);
    },
  });

export const useBuildingFloorsQuery = (buildingId?: string, enabled = true) =>
  useQuery({
    ...buildingFloorsQueryOptions(buildingId),
    enabled: enabled && Boolean(buildingId),
  });

export const floorGraphQueryOptions = (floorId?: string) =>
  queryOptions({
    queryKey: floorQueryKeys.graph(floorId),
    queryFn: ({ signal }) => {
      if (!floorId) throw new Error('맵 그래프 조회 조건이 필요합니다.');
      return getFloorGraph(floorId, signal);
    },
  });

export const floorImageQueryOptions = (buildingId?: string, floorId?: string) =>
  queryOptions({
    queryKey: floorQueryKeys.image(buildingId, floorId),
    queryFn: ({ signal }) => {
      if (!buildingId || !floorId) throw new Error('도면 이미지 조회 조건이 필요합니다.');
      return getFloorImageUrl(buildingId, floorId, signal);
    },
  });

export const floorGridQueryOptions = (floorId?: string) =>
  queryOptions({
    queryKey: floorQueryKeys.grid(floorId),
    queryFn: ({ signal }) => {
      if (!floorId) throw new Error('격자 조회 조건이 필요합니다.');
      return getFloorGridCells(floorId, signal);
    },
  });

export const floorCctvsQueryOptions = (floorId?: string) =>
  queryOptions({
    queryKey: floorQueryKeys.cctv(floorId),
    queryFn: ({ signal }) => {
      if (!floorId) throw new Error('CCTV 조회 조건이 필요합니다.');
      return getFloorCctvs(floorId, signal);
    },
  });

export const floorLightsQueryOptions = (floorId?: string) =>
  queryOptions({
    queryKey: floorQueryKeys.light(floorId),
    queryFn: ({ signal }) => {
      if (!floorId) throw new Error('유도등 조회 조건이 필요합니다.');
      return getFloorLights(floorId, signal);
    },
  });

export const floorUserZonesQueryOptions = (floorId?: string) =>
  queryOptions({
    queryKey: floorQueryKeys.zone(floorId),
    queryFn: async ({ signal }): Promise<UserZoneWithCells[]> => {
      if (!floorId) throw new Error('사용자 지정 영역 조회 조건이 필요합니다.');
      const zoneList = await getFloorUserZones(floorId, signal);
      const details = await Promise.all(
        zoneList.map((zone) => getUserZoneDetail(floorId, zone.id, signal)),
      );
      return details.map((d) => ({
        id: d.id,
        name: d.name,
        floorNum: d.floorNum,
        cellIds: d.cells.map((c) => c.cellId),
      }));
    },
  });

export const useFloorGraphQuery = (floorId?: string, enabled = true) =>
  useQuery({
    ...floorGraphQueryOptions(floorId),
    enabled: enabled && Boolean(floorId),
  });

export const useFloorImageUrlQuery = (buildingId?: string, floorId?: string, enabled = true) =>
  useQuery({
    ...floorImageQueryOptions(buildingId, floorId),
    enabled: enabled && Boolean(buildingId && floorId),
  });

export const useFloorGridCellsQuery = (floorId?: string, enabled = true) =>
  useQuery({
    ...floorGridQueryOptions(floorId),
    enabled: enabled && Boolean(floorId),
  });

export const useFloorCctvsQuery = (floorId?: string, enabled = true) =>
  useQuery({
    ...floorCctvsQueryOptions(floorId),
    enabled: enabled && Boolean(floorId),
  });

export const useFloorLightsQuery = (floorId?: string, enabled = true) =>
  useQuery({
    ...floorLightsQueryOptions(floorId),
    enabled: enabled && Boolean(floorId),
  });

export const useFloorUserZonesQuery = (floorId?: string, enabled = true) =>
  useQuery({
    ...floorUserZonesQueryOptions(floorId),
    enabled: enabled && Boolean(floorId),
  });
