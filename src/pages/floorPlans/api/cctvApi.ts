import type {
  CctvRegistrationResponse,
  CctvResponse,
  ConfigureCctvGridCellsRequest,
  CreateCctvRequest,
  UpdateCctvRequest,
} from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';
import { toCctv } from '@apis/floors/cctvApi';
import type { Cctv } from '@apis/floors/cctvApi';

export { getFloorCctvs } from '@apis/floors/cctvApi';
export type { Cctv, CctvGridCell } from '@apis/floors/cctvApi';

export async function createCctv(body: CreateCctvRequest): Promise<Cctv> {
  const registration = await apiRequest<CctvRegistrationResponse, CreateCctvRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.CCTV.ROOT,
    body,
  });
  if (!registration.cctv) {
    throw new Error('CCTV 등록 응답에 cctv 정보가 없습니다.');
  }
  return toCctv(registration.cctv);
}

export async function configureCctvGridCells(cctvId: string, gridCellIds: string[]): Promise<Cctv> {
  const cctv = await apiRequest<CctvResponse, ConfigureCctvGridCellsRequest>({
    method: HTTP_METHOD.PUT,
    url: API_ENDPOINTS.CCTV.GRID_CELLS(cctvId),
    body: { gridCellIds },
  });
  return toCctv(cctv);
}

export async function updateCctv(cctvId: string, body: UpdateCctvRequest): Promise<Cctv> {
  const cctv = await apiRequest<CctvResponse, UpdateCctvRequest>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.CCTV.DETAIL(cctvId),
    body,
  });
  return toCctv(cctv);
}

export async function enableCctv(cctvId: string): Promise<Cctv> {
  const cctv = await apiRequest<CctvResponse>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.CCTV.ENABLE(cctvId),
  });
  return toCctv(cctv);
}

export async function disableCctv(cctvId: string): Promise<Cctv> {
  const cctv = await apiRequest<CctvResponse>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.CCTV.DISABLE(cctvId),
  });
  return toCctv(cctv);
}
