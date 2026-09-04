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

const requestGridCellsPage = (floorId: string, page: number, signal?: AbortSignal) =>
  request<FloorGridCellPageResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.FLOOR_GRID.CELLS(floorId),
    query: { page, size: GRID_CELLS_PAGE_SIZE },
    signal,
  });

export const getFloorGridCells = async (floorId: string, signal?: AbortSignal) => {
  const first = await requestGridCellsPage(floorId, 0, signal);
  const cells: FloorGridCell[] = (first.content ?? []).map(toFloorGridCell);
  if (first.last ?? true) return cells;

  // 이전엔 페이지를 하나씩 순서대로 기다려서, 그리드 배율을 작게 잡아 셀이 많아진 층은
  // 페이지 수만큼 왕복이 쌓여 "요청이 끝없이 올라오고" 로딩이 멈춘 것처럼 보였음 — 첫 페이지
  // 응답의 totalElements로 남은 페이지 수를 미리 알 수 있으니, 나머지는 한 번에 병렬로 요청함
  const totalPages = Math.max(1, Math.ceil((first.totalElements ?? 0) / GRID_CELLS_PAGE_SIZE));
  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => requestGridCellsPage(floorId, i + 1, signal)),
  );
  for (const response of remainingPages) {
    cells.push(...(response.content ?? []).map(toFloorGridCell));
  }

  return cells;
};
