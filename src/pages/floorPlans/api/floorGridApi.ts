import type {
  CreateOrUpdateFloorGridRequest,
  FloorGridCellPageResponse,
  FloorGridCellResponse,
  FloorGridResponse,
} from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface FloorGridCell {
  id: string;
  rowIndex: number;
  columnIndex: number;
  /** 0~1 비율 좌표로 추정 (다른 좌표 필드와 동일 규칙) */
  centerX: number;
  centerY: number;
  walkable: boolean;
}

export interface FloorGrid {
  floorId: string;
  cellSizeMeter: number;
  rows: number;
  columns: number;
}

const toFloorGridCell = (response: FloorGridCellResponse): FloorGridCell => {
  const { id, rowIndex, columnIndex, centerX, centerY } = response;
  if (
    !id ||
    rowIndex === undefined ||
    columnIndex === undefined ||
    centerX === undefined ||
    centerY === undefined
  ) {
    throw new Error('그리드 셀 응답에 필수 필드가 누락되었습니다.');
  }
  return { id, rowIndex, columnIndex, centerX, centerY, walkable: response.walkable ?? true };
};

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

// 편집 화면에서 전체 그리드를 한 번에 보여줘야 해서 페이지 크기를 크게 잡아 한 번에 가져옴
export async function getFloorGridCells(floorId: string): Promise<FloorGridCell[]> {
  const page = await apiRequest<FloorGridCellPageResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.FLOOR_GRID.CELLS(floorId),
    query: { page: 0, size: 5000 },
  });
  return (page.content ?? []).map(toFloorGridCell);
}
