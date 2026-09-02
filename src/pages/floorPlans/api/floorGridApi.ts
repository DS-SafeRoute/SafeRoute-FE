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

export async function setFloorGrid(floorId: string, cellSizeMeter: number): Promise<FloorGrid> {
  const grid = await apiRequest<FloorGridResponse, CreateOrUpdateFloorGridRequest>({
    method: HTTP_METHOD.PUT,
    url: API_ENDPOINTS.FLOOR_GRID.ROOT(floorId),
    body: { cellSizeMeter },
  });
  const { floorId: id, cellSizeMeter: size, rows, columns } = grid;
  if (!id || size === undefined || rows === undefined || columns === undefined) {
    throw new Error('그리드 응답에 필수 필드가 누락되었습니다.');
  }
  return { floorId: id, cellSizeMeter: size, rows, columns };
}
