import type {
  EvacuationRouteResponse,
  FloorGraphResponse,
  MapNodeResponse,
} from '@apis/__generated__/data-contracts';

import * as styles from './TrainingFloorPlan.css';

interface TrainingFloorPlanProps {
  graph?: FloorGraphResponse;
  route?: EvacuationRouteResponse;
  isLoading: boolean;
  emptyMessage?: string;
}

interface PositionedNode extends MapNodeResponse {
  id: string;
  x: number;
  y: number;
}

const isPositionedNode = (node: MapNodeResponse): node is PositionedNode =>
  Boolean(node.id) && typeof node.x === 'number' && typeof node.y === 'number';

const TrainingFloorPlan = ({ graph, route, isLoading, emptyMessage }: TrainingFloorPlanProps) => {
  const nodes = graph?.nodes?.filter(isPositionedNode) ?? [];

  if (isLoading) {
    return <div className={styles.state}>도면과 대피 경로를 불러오는 중...</div>;
  }

  if (nodes.length === 0) {
    return <div className={styles.state}>{emptyMessage ?? '표시할 도면 그래프가 없습니다.'}</div>;
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const xValues = nodes.map((node) => node.x);
  const yValues = nodes.map((node) => node.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const padding = Math.max(width, height) * 0.12;
  const markerRadius = Math.max(width, height) * 0.018;
  const labelFontSize = Math.max(width, height) * 0.035;
  const routeNodes = route?.path?.filter(isPositionedNode) ?? [];
  const routeNodeIds = new Set(routeNodes.map((node) => node.id));
  const startNodeId = routeNodes[0]?.id;

  return (
    <div className={styles.canvas}>
      <svg
        className={styles.graph}
        viewBox={`${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`}
        role="img"
        aria-label="훈련 층의 노드, 연결 구간, 현재 대피 경로"
      >
        <g className={styles.edges}>
          {graph?.edges?.map((edge) => {
            const from = edge.fromNodeId ? nodeById.get(edge.fromNodeId) : undefined;
            const to = edge.toNodeId ? nodeById.get(edge.toNodeId) : undefined;
            if (!edge.id || !from || !to) return null;

            return <line key={edge.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })}
        </g>

        {routeNodes.length > 1 && (
          <polyline
            className={styles.route}
            points={routeNodes.map((node) => `${node.x},${node.y}`).join(' ')}
          />
        )}

        {routeNodes[0] && (
          <circle
            className={styles.fireHalo}
            cx={routeNodes[0].x}
            cy={routeNodes[0].y}
            r={markerRadius * 3}
          />
        )}

        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              className={
                node.id === startNodeId
                  ? styles.startNode
                  : routeNodeIds.has(node.id)
                    ? styles.routeNode
                    : styles.node
              }
              cx={node.x}
              cy={node.y}
              r={markerRadius}
            >
              <title>{node.name || node.code || node.type || '노드'}</title>
            </circle>
            {(node.isExitTarget || node.id === startNodeId) && (
              <text
                className={styles.nodeLabel}
                x={node.x}
                y={node.y - markerRadius * 2}
                fontSize={labelFontSize}
                textAnchor="middle"
              >
                {node.name || node.code || (node.isExitTarget ? '출구' : '출발')}
              </text>
            )}
          </g>
        ))}
      </svg>
      {emptyMessage ? <p className={styles.notice}>{emptyMessage}</p> : null}
    </div>
  );
};

export default TrainingFloorPlan;
