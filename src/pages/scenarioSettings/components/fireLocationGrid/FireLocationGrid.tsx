import { memo, useEffect, useMemo, useState } from 'react';

import type { FloorGridCell } from '@apis/floors/floorGridApi';
import type { FloorGraph } from '@apis/floors/mapGraphApi';

import {
  CANVAS_W,
  getCanvasHeight,
  getGridCellPxSize,
  measureImageAspect,
} from '@utils/floorCanvas';

import * as styles from './FireLocationGrid.css';

const DEFAULT_CANVAS_HEIGHT = 420;

interface FireLocationGridProps {
  imageUrl?: string | null;
  graph?: FloorGraph | null;
  gridCells: readonly FloorGridCell[];
  routeNodeIds: readonly string[];
  fireCellIds: readonly string[];
  selectedFireCellId?: string | null;
  selectedStartNodeId?: string | null;
  persistedStartNodeId?: string | null;
  unavailableStartNodeIds: readonly string[];
  originCellId?: string | null;
  statusMessage?: string;
  disabled?: boolean;
  startSelectionDisabled?: boolean;
  onFireCellSelect?: (cellId: string) => void;
  onStartNodeSelect?: (nodeId: string) => void;
}

const getCellClassName = (isFireCell: boolean, isSelected: boolean) => {
  if (isFireCell) return styles.fireCell;
  if (isSelected) return styles.selectedFireCell;
  return styles.gridCell;
};

const getStartNodeClassName = (
  isSelected: boolean,
  isUnavailable: boolean,
  isDisabled: boolean,
) => {
  if (isSelected && isUnavailable) return styles.selectedUnavailableStartNode;
  if (isUnavailable) return styles.unavailableStartNode;
  if (isSelected) return styles.selectedStartNode;
  if (isDisabled) return styles.inactiveStartNode;
  return styles.startNode;
};

const FireLocationGrid = ({
  imageUrl,
  graph,
  gridCells,
  routeNodeIds,
  fireCellIds,
  selectedFireCellId,
  selectedStartNodeId,
  persistedStartNodeId,
  unavailableStartNodeIds,
  originCellId,
  statusMessage,
  disabled = false,
  startSelectionDisabled = false,
  onFireCellSelect,
  onStartNodeSelect,
}: FireLocationGridProps) => {
  const [imageAspect, setImageAspect] = useState<number | null>(null);

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

  const mapHeight = getCanvasHeight(gridCells, imageAspect, DEFAULT_CANVAS_HEIGHT);
  const nodeById = useMemo(
    () => new Map(graph?.nodes.map((node) => [node.id, node]) ?? []),
    [graph],
  );
  const routePoints = useMemo(
    () =>
      routeNodeIds
        .map((nodeId) => nodeById.get(nodeId))
        .filter((node) => node !== undefined)
        .map((node) => `${node.x * CANVAS_W},${node.y * mapHeight}`)
        .join(' '),
    [mapHeight, nodeById, routeNodeIds],
  );
  const cellSize = getGridCellPxSize(gridCells, mapHeight);
  const fireCellIdSet = useMemo(() => new Set(fireCellIds), [fireCellIds]);
  const unavailableStartNodeIdSet = useMemo(
    () => new Set(unavailableStartNodeIds),
    [unavailableStartNodeIds],
  );
  const activeStartNodeId = persistedStartNodeId ?? selectedStartNodeId;
  const canSelectStartNode = !disabled && !startSelectionDisabled;

  return (
    <div className={styles.panel}>
      <svg
        className={styles.map}
        viewBox={`0 0 ${CANVAS_W} ${mapHeight}`}
        role="group"
        aria-label="발화 위치와 대피 경로가 표시된 층 도면"
      >
        {imageUrl && (
          <image
            href={imageUrl}
            width={CANVAS_W}
            height={mapHeight}
            preserveAspectRatio="xMidYMid slice"
          />
        )}

        {routePoints && <polyline className={styles.route} points={routePoints} />}

        {gridCells.map((cell) => {
          const isFireCell = fireCellIdSet.has(cell.id);
          const isOrigin = cell.id === originCellId;
          const isSelected = cell.id === selectedFireCellId;
          const x = cell.centerX * CANVAS_W - cellSize.w / 2;
          const y = cell.centerY * mapHeight - cellSize.h / 2;

          const cellClassName = getCellClassName(isFireCell, isSelected);

          return (
            <g
              key={cell.id}
              aria-label={`${cell.rowIndex + 1}행 ${cell.columnIndex + 1}열${isFireCell ? ', 화재구역' : ''}`}
            >
              <rect
                className={cellClassName}
                x={x}
                y={y}
                width={cellSize.w}
                height={cellSize.h}
                role={!disabled && cell.walkable ? 'button' : undefined}
                tabIndex={!disabled && cell.walkable ? 0 : undefined}
                aria-pressed={isSelected}
                onClick={() => {
                  if (!disabled && cell.walkable) onFireCellSelect?.(cell.id);
                }}
                onKeyDown={(event) => {
                  if (disabled || !cell.walkable) return;
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  onFireCellSelect?.(cell.id);
                }}
              />
              {isSelected && !isOrigin && (
                <text
                  className={styles.selectedFireMarker}
                  x={cell.centerX * CANVAS_W}
                  y={cell.centerY * mapHeight}
                >
                  🔥
                </text>
              )}
              {isOrigin && (
                <text
                  className={styles.fireMarker}
                  x={cell.centerX * CANVAS_W}
                  y={cell.centerY * mapHeight - 7}
                >
                  <tspan aria-hidden="true">🔥</tspan>
                </text>
              )}
            </g>
          );
        })}

        {graph?.nodes
          .filter((node) => node.type === 'START')
          .map((node) => {
            const isSelectedStart = node.id === activeStartNodeId;
            const isUnavailableStart = unavailableStartNodeIdSet.has(node.id);
            const isStartNodeSelectable = canSelectStartNode && !isUnavailableStart;
            const nodeClassName = getStartNodeClassName(
              isSelectedStart,
              isUnavailableStart,
              !canSelectStartNode,
            );

            return (
              <circle
                key={node.id}
                className={nodeClassName}
                cx={node.x * CANVAS_W}
                cy={node.y * mapHeight}
                r={isSelectedStart ? 7 : 4}
                role={isStartNodeSelectable ? 'button' : undefined}
                tabIndex={isStartNodeSelectable ? 0 : undefined}
                aria-label={`${node.name} 시작 지점${isUnavailableStart ? ', 출구 연결 필요' : ''}`}
                aria-pressed={isSelectedStart}
                aria-disabled={isUnavailableStart || undefined}
                onClick={() => {
                  if (isStartNodeSelectable) onStartNodeSelect?.(node.id);
                }}
                onKeyDown={(event) => {
                  if (!isStartNodeSelectable) return;
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  onStartNodeSelect?.(node.id);
                }}
              />
            );
          })}
      </svg>

      {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
    </div>
  );
};

export default memo(FireLocationGrid);
