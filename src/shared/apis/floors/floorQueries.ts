import { queryOptions, useQuery } from '@tanstack/react-query';

import { getFloorCctvs } from './cctvApi';
import { getFloorGridCells } from './floorGridApi';
import { getBuildingFloors, getFloorImageUrl } from './floorsApi';
import { getFloorLights } from './iotLightsApi';
import { getFloorGraph } from './mapGraphApi';

export const floorQueryKeys = {
  all: ['floors'] as const,
  lists: () => [...floorQueryKeys.all, 'list'] as const,
  list: (buildingId?: string) => [...floorQueryKeys.lists(), buildingId] as const,
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
};

export const buildingFloorsQueryOptions = (buildingId: string) =>
  queryOptions({
    queryKey: floorQueryKeys.list(buildingId),
    queryFn: ({ signal }) => getBuildingFloors(buildingId, signal),
  });

export const floorGraphQueryOptions = (floorId: string) =>
  queryOptions({
    queryKey: floorQueryKeys.graph(floorId),
    queryFn: ({ signal }) => getFloorGraph(floorId, signal),
  });

export const useFloorGraphQuery = (floorId?: string, enabled = true) =>
  useQuery({
    queryKey: floorQueryKeys.graph(floorId),
    queryFn: ({ signal }) => {
      if (!floorId) throw new Error('맵 그래프 조회 조건이 필요합니다.');
      return getFloorGraph(floorId, signal);
    },
    enabled: enabled && Boolean(floorId),
  });

export const useFloorImageUrlQuery = (buildingId?: string, floorId?: string, enabled = true) =>
  useQuery({
    queryKey: floorQueryKeys.image(buildingId, floorId),
    queryFn: ({ signal }) => {
      if (!buildingId || !floorId) throw new Error('도면 이미지 조회 조건이 필요합니다.');
      return getFloorImageUrl(buildingId, floorId, signal);
    },
    enabled: enabled && Boolean(buildingId && floorId),
  });

export const useFloorGridCellsQuery = (floorId?: string, enabled = true) =>
  useQuery({
    queryKey: floorQueryKeys.grid(floorId),
    queryFn: ({ signal }) => {
      if (!floorId) throw new Error('격자 조회 조건이 필요합니다.');
      return getFloorGridCells(floorId, signal);
    },
    enabled: enabled && Boolean(floorId),
  });

export const useFloorCctvsQuery = (floorId?: string, enabled = true) =>
  useQuery({
    queryKey: floorQueryKeys.cctv(floorId),
    queryFn: ({ signal }) => {
      if (!floorId) throw new Error('CCTV 조회 조건이 필요합니다.');
      return getFloorCctvs(floorId, signal);
    },
    enabled: enabled && Boolean(floorId),
  });

export const useFloorLightsQuery = (floorId?: string, enabled = true) =>
  useQuery({
    queryKey: floorQueryKeys.light(floorId),
    queryFn: ({ signal }) => {
      if (!floorId) throw new Error('유도등 조회 조건이 필요합니다.');
      return getFloorLights(floorId, signal);
    },
    enabled: enabled && Boolean(floorId),
  });
