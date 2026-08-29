import type { EvacuationRouteResponse } from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface GetEvacuationRouteParams {
  floorId: string;
  startNodeId: string;
}

export const getEvacuationRoute = (
  { floorId, startNodeId }: GetEvacuationRouteParams,
  signal?: AbortSignal,
) =>
  request<EvacuationRouteResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.EVACUATION_ROUTES.SHORTEST(floorId),
    query: { startNodeId },
    signal,
  });
