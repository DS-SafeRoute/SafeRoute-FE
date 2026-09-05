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
// 배율을 작게 잡아 셀이 아주 많은 층(수십 페이지)에서 남은 페이지를 전부 한 번에 쏘면 브라우저·
// 서버 동시 요청이 과도해질 수 있어(코드래빗 리뷰 반영), 이 개수만큼씩 나눠서 순차 처리함
const MAX_CONCURRENT_PAGE_REQUESTS = 4;

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
  // 응답의 totalElements로 남은 페이지 수를 미리 알 수 있으니, 나머지를 MAX_CONCURRENT_PAGE_REQUESTS개씩
  // 묶어 병렬로 요청함(전부 한꺼번에 쏘지는 않음)
  const totalPages = Math.max(1, Math.ceil((first.totalElements ?? 0) / GRID_CELLS_PAGE_SIZE));
  const remainingPageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 1);

  for (let i = 0; i < remainingPageNumbers.length; i += MAX_CONCURRENT_PAGE_REQUESTS) {
    const batch = remainingPageNumbers.slice(i, i + MAX_CONCURRENT_PAGE_REQUESTS);
    const responses = await Promise.all(
      batch.map((page) => requestGridCellsPage(floorId, page, signal)),
    );
    for (const response of responses) {
      cells.push(...(response.content ?? []).map(toFloorGridCell));
    }
  }

  return cells;
};
