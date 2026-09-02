import type {
  FloorGridCellPageResponse,
  FloorGridCellResponse,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface FloorGridCell {
  id: string;
  rowIndex: number;
  columnIndex: number;
  centerX: number;
  centerY: number;
  walkable: boolean;
  /** 화재 확산 시뮬레이션에서 이 셀이 불에 탄 상태인지 (훈련 중에만 true가 됨) */
  fired: boolean;
}

export const toFloorGridCell = (response: FloorGridCellResponse): FloorGridCell => {
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

  return {
    id,
    rowIndex,
    columnIndex,
    centerX,
    centerY,
    walkable: response.walkable ?? false,
    fired: response.fired ?? false,
  };
};

const GRID_CELLS_PAGE_SIZE = 2000;

export const getFloorGridCells = async (floorId: string, signal?: AbortSignal) => {
  const cells: FloorGridCell[] = [];
  let page = 0;
  let isLastPage = false;

  while (!isLastPage) {
    const response = await request<FloorGridCellPageResponse>({
      method: HTTP_METHOD.GET,
      url: API_ENDPOINTS.FLOOR_GRID.CELLS(floorId),
      query: { page, size: GRID_CELLS_PAGE_SIZE },
      signal,
    });
    cells.push(...(response.content ?? []).map(toFloorGridCell));
    isLastPage = response.last ?? true;
    page += 1;
  }

  return cells;
};
