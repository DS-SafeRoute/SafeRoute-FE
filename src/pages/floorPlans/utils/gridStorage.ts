// 백엔드에 "이 층의 배율" 조회 API가 없다(PUT /grid만 있고 GET /grid 없음).
// 그래서 배율을 브라우저에 기록해뒀다가 필요할 때 되찾아 쓴다 — 도면 업로드(FloorPlansPage)와
// 상세 화면(FloorPlansDetailPage) 양쪽에서 같은 키를 읽고 쓰므로 한 곳에 모아 export함.
export const GRID_SIZE_KEY = (floorId: string) => `saferoute:gridCellSize:${floorId}`;
export const PENDING_GRID_SIZE_KEY = (floorId: string) =>
  `saferoute:pendingGridCellSize:${floorId}`;

export const readStoredNumber = (key: string): number | null => {
  try {
    const value = Number(localStorage.getItem(key) ?? sessionStorage.getItem(key));
    return value > 0 ? value : null;
  } catch {
    return null;
  }
};

// 확정된 배율을 기록하고, 더는 필요 없는 pending 값은 지움
export const rememberGridSize = (floorId: string, cellSizeMeter: number) => {
  try {
    localStorage.setItem(GRID_SIZE_KEY(floorId), String(cellSizeMeter));
    localStorage.removeItem(PENDING_GRID_SIZE_KEY(floorId));
    sessionStorage.removeItem(PENDING_GRID_SIZE_KEY(floorId));
  } catch {
    /* 스토리지 사용 불가 환경 — 기록만 생략 */
  }
};

// 업로드 직후 — AI 분석이 배율을 지우더라도 복원할 수 있도록 먼저 pending과 확정 값을 함께 기록
export const rememberPendingGridSize = (floorId: string, cellSizeMeter: number) => {
  try {
    localStorage.setItem(PENDING_GRID_SIZE_KEY(floorId), String(cellSizeMeter));
    localStorage.setItem(GRID_SIZE_KEY(floorId), String(cellSizeMeter));
  } catch {
    /* 스토리지 사용 불가 환경 — 기록만 생략 */
  }
};
