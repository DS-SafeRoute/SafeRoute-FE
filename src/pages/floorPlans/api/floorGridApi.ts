import type {
  CreateOrUpdateFloorGridRequest,
  FloorGridResponse,
} from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface FloorGrid {
  floorId: string;
  cellSizeMeter: number;
  rows: number;
  columns: number;
}

export { getFloorGridCells } from '@apis/floors/floorGridApi';
export type { FloorGridCell } from '@apis/floors/floorGridApi';

// 그리드 배율 설정(생성/수정 겸용). 요청이 200으로 돌아왔다면 서버에는 이미 반영된 것이므로,
// 응답 바디에 일부 필드가 없더라도 실패로 취급하지 않는다 — 예전에는 여기서 throw해서
// 성공한 설정을 실패로 만들고 뒤따르는 셀 재조회까지 건너뛰는 문제가 있었음
export async function setFloorGrid(floorId: string, cellSizeMeter: number): Promise<FloorGrid> {
  const grid = await apiRequest<FloorGridResponse, CreateOrUpdateFloorGridRequest>({
    method: HTTP_METHOD.PUT,
    url: API_ENDPOINTS.FLOOR_GRID.ROOT(floorId),
    body: { cellSizeMeter },
  });
  if (import.meta.env.DEV) {
    console.warn('[그리드 배율 설정] 응답:', grid);
  }
  return {
    floorId: grid?.floorId ?? floorId,
    cellSizeMeter: grid?.cellSizeMeter ?? cellSizeMeter,
    rows: grid?.rows ?? 0,
    columns: grid?.columns ?? 0,
  };
}
