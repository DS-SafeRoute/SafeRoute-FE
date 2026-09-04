import type { FloorGridCell } from '@apis/floors/floorGridApi';

// 도면 SVG 좌표계의 공통 기준. 도면 관리와 시나리오 설정이 같은 좌표 계산을 사용한다.
export const CANVAS_W = 560;

// 그리드 행·열 수 — 셀이 수십만 개까지 갈 수 있어서 Math.max(...spread) 대신 순회로 구함
// (스프레드는 인자 개수 한계로 RangeError: Maximum call stack size exceeded가 날 수 있음)
export const getGridDimensions = (
  cells: readonly FloorGridCell[],
): { cols: number; rows: number } => {
  let maxCol = 0;
  let maxRow = 0;
  for (const cell of cells) {
    if (cell.columnIndex > maxCol) maxCol = cell.columnIndex;
    if (cell.rowIndex > maxRow) maxRow = cell.rowIndex;
  }
  return { cols: maxCol + 1, rows: maxRow + 1 };
};

// 그리드 셀 하나의 SVG 픽셀 크기 — 캔버스(560 x canvasH)를 열/행 수로 그대로 나눔.
// 셀 rect가 캔버스를 정확히 타일링하고 `centerX*560 - w/2`가 실제 셀 왼쪽 변과 일치함
export const getGridCellPxSize = (
  cells: readonly FloorGridCell[],
  canvasH: number,
): { w: number; h: number } => {
  if (cells.length === 0) return { w: 20, h: 20 };
  const { cols, rows } = getGridDimensions(cells);
  return { w: CANVAS_W / cols, h: canvasH / rows };
};

// 셀의 (row,col) 인덱스만으로 픽셀 좌표를 뽑을 수 있도록 그리드 원점(0,0 셀의 좌상단)을 역산.
// 셀마다 제각각인 centerX/centerY(부동소수) 대신 원점+인덱스로 좌표를 계산하면 인접 셀의
// 공유 모서리 좌표가 정확히 일치해서, 경계선/격자선에 미세한 어긋남이나 이중선이 안 생김
export const getGridPxOrigin = (
  cells: readonly FloorGridCell[],
  size: { w: number; h: number },
  canvasH: number,
): { x: number; y: number } => {
  const ref = cells[0];
  if (!ref) return { x: 0, y: 0 };
  return {
    x: ref.centerX * CANVAS_W - size.w / 2 - ref.columnIndex * size.w,
    y: ref.centerY * canvasH - size.h / 2 - ref.rowIndex * size.h,
  };
};

// 셀 집합의 바깥 윤곽선을 하나의 SVG path(d)로. 셀별 rect를 이어 붙이면 반투명 채움 사이에
// 이음매가 보여 "직사각형의 집합"처럼 보이므로, 합집합 윤곽을 구해 단일 도형으로 그림.
// 셀이 하나뿐이어도(발화점·시작 노드처럼 단일 선택) 그 셀 하나의 사각 윤곽으로 잘 동작함
export const buildZoneOutlinePath = (
  cells: readonly FloorGridCell[],
  size: { w: number; h: number },
  canvasH: number,
): string => {
  const origin = getGridPxOrigin(cells, size, canvasH);
  const cellKey = (col: number, row: number) => `${col},${row}`;
  const inZone = new Set(cells.map((c) => cellKey(c.columnIndex, c.rowIndex)));
  const cornerX = (col: number) => origin.x + col * size.w;
  const cornerY = (row: number) => origin.y + row * size.h;
  const ptKey = (x: number, y: number) => `${x},${y}`;

  // 이웃이 없는 변만 방향성 있게 수집(셀 기준 시계방향) → 이어 붙이면 닫힌 윤곽이 됨
  const nextByStart = new Map<string, { x: number; y: number }>();
  cells.forEach((c) => {
    const { columnIndex: col, rowIndex: row } = c;
    const tl = { x: cornerX(col), y: cornerY(row) };
    const tr = { x: cornerX(col + 1), y: cornerY(row) };
    const br = { x: cornerX(col + 1), y: cornerY(row + 1) };
    const bl = { x: cornerX(col), y: cornerY(row + 1) };
    if (!inZone.has(cellKey(col, row - 1))) nextByStart.set(ptKey(tl.x, tl.y), tr);
    if (!inZone.has(cellKey(col + 1, row))) nextByStart.set(ptKey(tr.x, tr.y), br);
    if (!inZone.has(cellKey(col, row + 1))) nextByStart.set(ptKey(br.x, br.y), bl);
    if (!inZone.has(cellKey(col - 1, row))) nextByStart.set(ptKey(bl.x, bl.y), tl);
  });

  let d = '';
  const visited = new Set<string>();
  for (const startKey of nextByStart.keys()) {
    if (visited.has(startKey)) continue;
    const [sx, sy] = startKey.split(',').map(Number);
    d += `M${sx} ${sy}`;
    let curKey = startKey;
    while (true) {
      const next = nextByStart.get(curKey);
      if (!next) break;
      visited.add(curKey);
      d += `L${next.x} ${next.y}`;
      const nextKey = ptKey(next.x, next.y);
      if (nextKey === startKey) {
        d += 'Z';
        break;
      }
      if (visited.has(nextKey)) break;
      curKey = nextKey;
    }
  }
  return d;
};

// 도면 이미지 원본 가로/세로 비율 측정 — canvasH(SVG viewBox 높이) 계산의 대체 기준으로 씀
// (그리드가 아직 없을 때). new Image()로 미리 로드해서 naturalWidth/Height만 얻고 버림
export const measureImageAspect = (imageUrl: string): Promise<number | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : null);
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });

// SVG viewBox 높이 — 폭 CANVAS_W(560)은 고정, 높이만 도면 실제 비율에 맞춤. 그리드
// columns/rows 비율을 우선으로 씀(셀 크기는 CANVAS_W/cols × canvasH/rows로 계산되므로 이 값이
// 이미지의 원본 픽셀 비율과 어긋나면 정사각형이어야 할 셀이 직사각형으로 보임). 스캔·촬영한
// 도면은 실측 비율과 이미지 픽셀 비율이 딱 맞아떨어지지 않는 경우가 많아, 그리드가 아직
// 없을 때(분석 전)만 이미지 비율로 대체하고 그것도 없으면 기본값을 씀
export const getCanvasHeight = (
  cells: readonly FloorGridCell[],
  imageAspect: number | null,
  defaultHeight: number,
): number => {
  if (cells.length > 0) {
    const { cols, rows } = getGridDimensions(cells);
    if (cols > 0 && rows > 0) return (CANVAS_W * rows) / cols;
  }
  if (imageAspect && imageAspect > 0) return CANVAS_W / imageAspect;
  return defaultHeight;
};
