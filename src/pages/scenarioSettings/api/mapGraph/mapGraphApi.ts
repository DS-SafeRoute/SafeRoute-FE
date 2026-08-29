import type { FloorGraphResponse, FloorResponse } from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export const getBuildingFloors = (buildingId: string, signal?: AbortSignal) =>
  request<FloorResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.FLOORS.ROOT(buildingId),
    signal,
  });

export const getFloorGraph = (floorId: string, signal?: AbortSignal) =>
  request<FloorGraphResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.MAP_GRAPH.DETAIL(floorId),
    signal,
  });
