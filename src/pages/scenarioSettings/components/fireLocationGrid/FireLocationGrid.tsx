import { memo, useMemo } from 'react';

import type { FloorGridCell } from '@apis/floors/floorGridApi';
import type { FloorGraph } from '@apis/floors/mapGraphApi';

import * as styles from './FireLocationGrid.css';

const MAP_WIDTH = 100;
const MAP_HEIGHT = 75;

interface FireLocationGridProps {
  imageUrl?: string | null;
  graph?: FloorGraph | null;
  gridCells: readonly FloorGridCell[];
  routeNodeIds: readonly string[];
  fireCellIds: readonly string[];
  originCellId?: string | null;
  statusMessage?: string;
}

const getGridCellSize = (cells: readonly FloorGridCell[]) => {
  const rowCount = Math.max(...cells.map((cell) => cell.rowIndex), 0) + 1;
  const columnCount = Math.max(...cells.map((cell) => cell.columnIndex), 0) + 1;
  return { width: MAP_WIDTH / columnCount, height: MAP_HEIGHT / rowCount };
};

const FireLocationGrid = ({
  imageUrl,
  graph,
  gridCells,
  routeNodeIds,
  fireCellIds,
  originCellId,
  statusMessage,
}: FireLocationGridProps) => {
  const nodeById = useMemo(
    () => new Map(graph?.nodes.map((node) => [node.id, node]) ?? []),
    [graph],
  );
  const routePoints = useMemo(
    () =>
      routeNodeIds
        .map((nodeId) => nodeById.get(nodeId))
        .filter((node) => node !== undefined)
        .map((node) => `${node.x * MAP_WIDTH},${node.y * MAP_HEIGHT}`)
        .join(' '),
    [nodeById, routeNodeIds],
  );
  const cellSize = useMemo(() => getGridCellSize(gridCells), [gridCells]);
  const fireCellIdSet = useMemo(() => new Set(fireCellIds), [fireCellIds]);

  return (
    <div className={styles.panel}>
      <svg
        className={styles.map}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="group"
        aria-label="발화 위치와 대피 경로가 표시된 층 도면"
      >
        {imageUrl ? (
          <image
            href={imageUrl}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : null}

        {graph?.edges.map((edge) => {
          const fromNode = nodeById.get(edge.fromNodeId);
          const toNode = nodeById.get(edge.toNodeId);
          if (!fromNode || !toNode) return null;

          return (
            <line
              key={edge.id}
              className={styles.graphEdge}
              x1={fromNode.x * MAP_WIDTH}
              y1={fromNode.y * MAP_HEIGHT}
              x2={toNode.x * MAP_WIDTH}
              y2={toNode.y * MAP_HEIGHT}
            />
          );
        })}

        {routePoints ? <polyline className={styles.route} points={routePoints} /> : null}

        {gridCells.map((cell) => {
          const isFireCell = fireCellIdSet.has(cell.id);
          const isOrigin = cell.id === originCellId;
          const x = cell.centerX * MAP_WIDTH - cellSize.width / 2;
          const y = cell.centerY * MAP_HEIGHT - cellSize.height / 2;

          return (
            <g
              key={cell.id}
              aria-label={`${cell.rowIndex + 1}행 ${cell.columnIndex + 1}열${isFireCell ? ', 화재구역' : ''}`}
            >
              <rect
                className={isFireCell ? styles.fireCell : styles.gridCell}
                x={x}
                y={y}
                width={cellSize.width}
                height={cellSize.height}
              />
              {isOrigin ? (
                <text
                  className={styles.fireMarker}
                  x={cell.centerX * MAP_WIDTH}
                  y={cell.centerY * MAP_HEIGHT - 1}
                >
                  <tspan aria-hidden="true">🔥</tspan>
                  <tspan x={cell.centerX * MAP_WIDTH} dy="4">
                    최초 발화점
                  </tspan>
                </text>
              ) : null}
            </g>
          );
        })}

        {graph?.nodes.map((node) => (
          <circle
            key={node.id}
            className={node.isExitTarget ? styles.exitNode : styles.graphNode}
            cx={node.x * MAP_WIDTH}
            cy={node.y * MAP_HEIGHT}
            r={node.id === routeNodeIds[0] ? 1.2 : 0.7}
          />
        ))}
      </svg>

      {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}
    </div>
  );
};

export default memo(FireLocationGrid);
