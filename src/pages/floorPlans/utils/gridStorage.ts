// 백엔드에 "이 층의 배율" 조회 API가 없다(PUT /grid만 있고 GET /grid 없음).
// 그래서 배율을 브라우저에 기록해뒀다가 필요할 때 되찾아 쓴다 — 도면 업로드(FloorPlansPage)와
// 상세 화면(FloorPlansDetailPage) 양쪽에서 같은 키를 읽고 쓰므로 한 곳에 모아 export함.
// 기존 키에는 m 단위 값이 저장돼 있으므로 cm 값을 같은 키에 덮어쓰지 않는다.
// 단위가 명시된 새 키를 사용해 기존 값이 100분의 1 크기로 오해되는 것을 방지한다.
export const GRID_SIZE_KEY = (floorId: string) => `saferoute:gridCellSizeCm:${floorId}`;
export const PENDING_GRID_SIZE_KEY = (floorId: string) =>
  `saferoute:pendingGridCellSizeCm:${floorId}`;

export const readStoredNumber = (key: string): number | null => {
  try {
    const value = Number(localStorage.getItem(key) ?? sessionStorage.getItem(key));
    return value > 0 ? value : null;
  } catch {
    return null;
  }
};

// 확정된 배율을 기록하고, 더는 필요 없는 pending 값은 지움
export const rememberGridSize = (floorId: string, cellSizeCm: number) => {
  try {
    localStorage.setItem(GRID_SIZE_KEY(floorId), String(cellSizeCm));
    localStorage.removeItem(PENDING_GRID_SIZE_KEY(floorId));
    sessionStorage.removeItem(PENDING_GRID_SIZE_KEY(floorId));
  } catch {
    /* 스토리지 사용 불가 환경 — 기록만 생략 */
  }
};

// 업로드 직후 — AI 분석이 배율을 지우더라도 복원할 수 있도록 먼저 pending과 확정 값을 함께 기록
export const rememberPendingGridSize = (floorId: string, cellSizeCm: number) => {
  try {
    localStorage.setItem(PENDING_GRID_SIZE_KEY(floorId), String(cellSizeCm));
    localStorage.setItem(GRID_SIZE_KEY(floorId), String(cellSizeCm));
  } catch {
    /* 스토리지 사용 불가 환경 — 기록만 생략 */
  }
};
