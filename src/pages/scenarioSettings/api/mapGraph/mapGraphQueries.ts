import { useQuery } from '@tanstack/react-query';

import { getBuildingFloors, getFloorGraph } from './mapGraphApi';

export const mapGraphQueryKeys = {
  all: ['map-graphs'] as const,
  floorLists: () => [...mapGraphQueryKeys.all, 'floor-list'] as const,
  floorList: (buildingId?: string) => [...mapGraphQueryKeys.floorLists(), buildingId] as const,
  details: () => [...mapGraphQueryKeys.all, 'detail'] as const,
  detail: (floorId?: string) => [...mapGraphQueryKeys.details(), floorId] as const,
};

export const useBuildingFloorsQuery = (buildingId?: string, enabled = true) =>
  useQuery({
    queryKey: mapGraphQueryKeys.floorList(buildingId),
    queryFn: ({ signal }) => {
      if (!buildingId) throw new Error('건물 ID가 필요합니다.');
      return getBuildingFloors(buildingId, signal);
    },
    enabled: enabled && Boolean(buildingId),
  });

export const useFloorGraphQuery = (floorId?: string, enabled = true) =>
  useQuery({
    queryKey: mapGraphQueryKeys.detail(floorId),
    queryFn: ({ signal }) => {
      if (!floorId) throw new Error('층 ID가 필요합니다.');
      return getFloorGraph(floorId, signal);
    },
    enabled: enabled && Boolean(floorId),
  });
