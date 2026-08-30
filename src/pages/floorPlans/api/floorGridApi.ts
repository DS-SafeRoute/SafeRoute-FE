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
  /** 화재 확산 시뮬레이션에서 이 셀이 불에 탄 상태인지 (훈련 중에만 true가 됨) */
  fired: boolean;
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
  // 대피 경로/CCTV 감시영역 계산에 쓰이는 값이라, 응답에 walkable이 없으면 통행 불가로 안전하게 처리
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

// 편집 화면에서 전체 그리드를 한 번에 보여줘야 해서, 셀이 페이지 크기를 넘는 큰 그리드도
// 놓치지 않도록 마지막 페이지까지 이어서 가져옴 (스웨거상 size 최대값이 2000이라 그 이하로 설정)
const GRID_CELLS_PAGE_SIZE = 2000;

export async function getFloorGridCells(floorId: string): Promise<FloorGridCell[]> {
  const cells: FloorGridCell[] = [];
  let page = 0;
  let isLastPage = false;

  while (!isLastPage) {
    const response = await apiRequest<FloorGridCellPageResponse>({
      method: HTTP_METHOD.GET,
      url: API_ENDPOINTS.FLOOR_GRID.CELLS(floorId),
      query: { page, size: GRID_CELLS_PAGE_SIZE },
    });
    cells.push(...(response.content ?? []).map(toFloorGridCell));
    isLastPage = response.last ?? true;
    page += 1;
  }

  return cells;
}
