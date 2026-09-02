import { useEffect, useState } from 'react';

import {
  CANVAS_W,
  buildZoneOutlinePath,
  getCanvasHeight,
  getGridCellPxSize,
  measureImageAspect,
} from '@pages/floorPlans/utils/gridGeometry';

import type { FloorGridCell } from '@apis/floors/floorGridApi';

import * as styles from './GridCellPickerCanvas.css';

const DEFAULT_CANVAS_H = 420;

/**
 * 도면 위에서 그리드 셀 하나를 골라야 하는 화면(발화점 지정·시작 노드 지정)을 위한
 * 독립 캔버스 — 확대/축소를 갖춘 도면 위에 그리드를 얹고, 클릭한 셀을 단일 선택으로 돌려줌.
 *
 * 도면관리상세의 거대한 FloorCanvas(노드 드래그·엣지 연결·구역 드래그까지 다 처리)와 달리
 * 이 컴포넌트는 "그리드 셀 하나 고르기" 그 자체만 함 — 상태는 셀 좌표 계산에 필요한 걸 전부
 * 이 컴포넌트 안에서 도면 이미지 비율까지 스스로 구하므로, 호스트 페이지는
 * `imageUrl`(도면 이미지 URL)과 `gridCells`(GET .../grid/cells 결과)만 넘기면 됨 —
 * 캔버스 크기·격자 렌더링·확대축소를 직접 구현할 필요가 없음.
 *
 * useEvacuationSetupDesignation(발화점 셀 선택)·useStartNodeDesignation과 짝이 맞도록
 * "단일 셀 선택"만 지원함(draftFireOriginCellId/draftCellId ↔ selectedCellId, selectCell ↔
 * onCellSelect). 여러 칸을 고르는 화면(구역 설정처럼)이 필요해지면 selectedCellIds: string[]을
 * 받는 별도 variant로 만드는 걸 권장 — 이 컴포넌트의 단일-선택 계약을 흐리지 않기 위함.
 */
interface GridCellPickerCanvasProps {
  imageUrl?: string | null;
  gridCells: readonly FloorGridCell[];
  // 지금 고르는 중인 셀(아직 저장 전) — 없으면 아무 것도 선택 표시 안 함
  selectedCellId?: string | null;
  onCellSelect?: (cellId: string) => void;
  // true면 셀 클릭을 막고 그리드만 보여줌(이미 지정 완료돼서 재선택이 불가능한 경우 등)
  disabled?: boolean;
  // 이미 서버에 등록되어 있는 위치 — selectedCellId(임시 선택)와 별개로 항상 강조 표시함
  markerCellId?: string | null;
  markerEmoji?: string;
  markerLabel?: string;
  className?: string;
}

const GridCellPickerCanvas = ({
  imageUrl,
  gridCells,
  selectedCellId,
  onCellSelect,
  disabled = false,
  markerCellId,
  markerEmoji = '🔥',
  markerLabel,
  className,
}: GridCellPickerCanvasProps) => {
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);

  // 도면 이미지가 바뀔 때마다 원본 비율을 다시 재서 캔버스 높이 계산에 씀(그리드가 없을 때의 대체 기준)
  useEffect(() => {
    setImageAspect(null);
    if (!imageUrl) return;
    let cancelled = false;
    void measureImageAspect(imageUrl).then((aspect) => {
      if (!cancelled) setImageAspect(aspect);
    });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  // 도면관리상세 본 캔버스와 완전히 같은 계산(gridGeometry.ts 단일 소스) — 여기서 따로
  // 다시 구현하면 그리드 행·열/이미지 비율 처리가 바뀔 때 한쪽만 갱신되어 좌표가 어긋날 수 있음
  const canvasH = getCanvasHeight(gridCells, imageAspect, DEFAULT_CANVAS_H);

  const cellSize = getGridCellPxSize(gridCells, canvasH);
  const selectedCell = gridCells.find((c) => c.id === selectedCellId) ?? null;
  const markerCell = markerCellId ? (gridCells.find((c) => c.id === markerCellId) ?? null) : null;
  const scale = zoom / 100;

  return (
    <div className={className}>
      <div className={styles.canvasWrap}>
        <div className={styles.zoomedArea} style={{ transform: `scale(${scale})` }}>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${CANVAS_W} ${canvasH}`}
            role="group"
            aria-label="그리드 셀을 선택하는 도면"
          >
            <rect width={CANVAS_W} height={canvasH} fill="#f8f9fa" />
            {imageUrl && (
              <image
                href={imageUrl}
                width={CANVAS_W}
                height={canvasH}
                preserveAspectRatio="xMidYMid slice"
              />
            )}

            {/* 균일 격자선(모눈종이) — 셀 경계를 눈으로 확인하는 용도, 클릭은 안 받음 */}
            {gridCells.length > 0 && (
              <GridOverlayLines cells={gridCells} size={cellSize} canvasH={canvasH} />
            )}

            {/* 지금 고른 셀 — 하나뿐이어도 buildZoneOutlinePath가 그 셀의 사각 윤곽을 그려줌 */}
            {selectedCell && (
              <path
                d={buildZoneOutlinePath([selectedCell], cellSize, canvasH)}
                fillRule="evenodd"
                fill="rgba(139,92,246,0.3)"
                stroke="#8b5cf6"
                strokeWidth="1.5"
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* 셀 클릭 판정 — 투명 히트영역. disabled면 아예 안 그려서 클릭 자체가 안 먹게 함.
                키보드 사용자도 선택할 수 있게 포커스 가능한 버튼 역할 + Enter/Space 처리를 붙임
                (코드래빗 리뷰 반영) */}
            {!disabled &&
              onCellSelect &&
              gridCells.map((cell) => (
                <rect
                  key={cell.id}
                  x={cell.centerX * CANVAS_W - cellSize.w / 2}
                  y={cell.centerY * canvasH - cellSize.h / 2}
                  width={cellSize.w}
                  height={cellSize.h}
                  fill="transparent"
                  style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${cell.rowIndex + 1}행 ${cell.columnIndex + 1}열 칸`}
                  aria-pressed={cell.id === selectedCellId}
                  onClick={() => onCellSelect(cell.id)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    onCellSelect(cell.id);
                  }}
                />
              ))}

            {markerCell && (
              <text
                className={styles.marker}
                x={markerCell.centerX * CANVAS_W}
                y={markerCell.centerY * canvasH - 2}
                textAnchor="middle"
              >
                <tspan aria-hidden="true">{markerEmoji}</tspan>
                {markerLabel && (
                  <tspan x={markerCell.centerX * CANVAS_W} dy="5">
                    {markerLabel}
                  </tspan>
                )}
              </text>
            )}
          </svg>
        </div>
      </div>

      <div className={styles.zoomControls}>
        <button
          type="button"
          className={styles.zoomButton}
          aria-label="축소"
          onClick={() => setZoom((v) => Math.max(50, v - 10))}
          disabled={zoom <= 50}
        >
          −
        </button>
        <button
          type="button"
          className={styles.zoomValue}
          onClick={() => setZoom(100)}
          title={zoom !== 100 ? '클릭해서 100%로' : undefined}
        >
          {zoom}%
        </button>
        <button
          type="button"
          className={styles.zoomButton}
          aria-label="확대"
          onClick={() => setZoom((v) => Math.min(200, v + 10))}
          disabled={zoom >= 200}
        >
          +
        </button>
      </div>
    </div>
  );
};

// 그리드 표시용 균일 격자선 — 도면관리상세(FloorPlansDetailPage)의 동명 컴포넌트와 로직은
// 같음(셀별 rect 대신 캔버스를 가로지르는 직선만 그어서 공유 변이 겹쳐 그려지지 않게 함).
// 순수 JSX 조립이라 갈라질 위험이 낮아 여기서는 따로 복제해서 이 컴포넌트를 완전히 독립시킴
const GridOverlayLines = ({
  cells,
  size,
  canvasH,
}: {
  cells: readonly FloorGridCell[];
  size: { w: number; h: number };
  canvasH: number;
}) => {
  if (cells.length === 0) return null;

  const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] ?? 0;
  };
  const phaseX = median(
    cells.map((c) => {
      const left = c.centerX * CANVAS_W - size.w / 2;
      return ((left % size.w) + size.w) % size.w;
    }),
  );
  const phaseY = median(
    cells.map((c) => {
      const top = c.centerY * canvasH - size.h / 2;
      return ((top % size.h) + size.h) % size.h;
    }),
  );
  const verticalXs: number[] = [];
  for (let x = phaseX; x <= CANVAS_W + 0.001; x += size.w) verticalXs.push(x);
  const horizontalYs: number[] = [];
  for (let y = phaseY; y <= canvasH + 0.001; y += size.h) horizontalYs.push(y);

  return (
    <g style={{ pointerEvents: 'none' }}>
      {verticalXs.map((x) => (
        <line
          key={`v${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasH}
          stroke="rgba(107,114,128,0.22)"
          strokeWidth="0.6"
        />
      ))}
      {horizontalYs.map((y) => (
        <line
          key={`h${y}`}
          x1={0}
          y1={y}
          x2={CANVAS_W}
          y2={y}
          stroke="rgba(107,114,128,0.22)"
          strokeWidth="0.6"
        />
      ))}
    </g>
  );
};

export default GridCellPickerCanvas;
