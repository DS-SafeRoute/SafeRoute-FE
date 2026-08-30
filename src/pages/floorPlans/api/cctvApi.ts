import type {
  CctvGridCellResponse,
  CctvRegistrationResponse,
  CctvResponse,
  ConfigureCctvGridCellsRequest,
  CreateCctvRequest,
  UpdateCctvRequest,
} from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface CctvGridCell {
  id: string;
  rowIndex: number;
  columnIndex: number;
  centerX: number;
  centerY: number;
  walkable: boolean;
}

export interface Cctv {
  id: string;
  code: string;
  name: string;
  floorId: string;
  /** 0~1 비율 좌표 */
  x: number;
  /** 0~1 비율 좌표 */
  y: number;
  enabled: boolean;
  monitoredGridCellCount: number;
  monitoredAreaM2: number;
  gridCells: CctvGridCell[];
}

const toCctvGridCell = (response: CctvGridCellResponse): CctvGridCell => {
  const { id, rowIndex, columnIndex, centerX, centerY } = response;
  if (
    !id ||
    rowIndex === undefined ||
    columnIndex === undefined ||
    centerX === undefined ||
    centerY === undefined
  ) {
    throw new Error('CCTV 그리드 셀 응답에 필수 필드가 누락되었습니다.');
  }
  return { id, rowIndex, columnIndex, centerX, centerY, walkable: response.walkable ?? true };
};

const toCctv = (response: CctvResponse): Cctv => {
  const { id, code, name, floorId, x, y } = response;
  if (!id || !code || !name || !floorId || x === undefined || y === undefined) {
    throw new Error('CCTV 응답에 필수 필드가 누락되었습니다.');
  }
  return {
    id,
    code,
    name,
    floorId,
    x,
    y,
    enabled: response.enabled ?? false,
    monitoredGridCellCount: response.monitoredGridCellCount ?? 0,
    monitoredAreaM2: response.monitoredAreaM2 ?? 0,
    gridCells: (response.gridCells ?? []).map(toCctvGridCell),
  };
};

export async function getFloorCctvs(floorId: string): Promise<Cctv[]> {
  const cctvs = await apiRequest<CctvResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.CCTV.ROOT,
    query: { floorId },
  });
  return cctvs.map(toCctv);
}

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
