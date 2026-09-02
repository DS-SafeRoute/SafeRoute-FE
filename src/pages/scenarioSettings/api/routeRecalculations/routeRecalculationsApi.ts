import type {
  RejectRouteRecalculationRequest,
  RouteRecalculationDetailResponse,
  RouteRecalculationResponse,
  RouteRecalculationSummaryResponse,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export type RouteRecalculationStatus = NonNullable<RouteRecalculationSummaryResponse['status']>;

export interface GetRouteRecalculationsParams {
  trainingSessionId: string;
  status?: RouteRecalculationStatus;
}

export interface RejectRouteRecalculationVariables {
  recalculationId: string;
  reason?: string;
}

export const getRouteRecalculations = (
  { trainingSessionId, status }: GetRouteRecalculationsParams,
  signal?: AbortSignal,
) =>
  request<RouteRecalculationSummaryResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.ROUTE_RECALCULATIONS.ROOT,
    query: { trainingSessionId, status },
    signal,
  });

export const getRouteRecalculationDetail = (recalculationId: string, signal?: AbortSignal) =>
  request<RouteRecalculationDetailResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.ROUTE_RECALCULATIONS.DETAIL(recalculationId),
    signal,
  });

export const patchApproveRouteRecalculation = (recalculationId: string) =>
  request<RouteRecalculationResponse>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.ROUTE_RECALCULATIONS.APPROVE(recalculationId),
  });

export const patchRejectRouteRecalculation = ({
  recalculationId,
  reason,
}: RejectRouteRecalculationVariables) =>
  request<RouteRecalculationResponse, RejectRouteRecalculationRequest>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.ROUTE_RECALCULATIONS.REJECT(recalculationId),
    body: reason ? { reason } : undefined,
  });
