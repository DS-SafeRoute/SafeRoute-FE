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
