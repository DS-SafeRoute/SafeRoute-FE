import type { FloorGraph } from '@apis/floors/mapGraphApi';

export type StartCandidateStatus = 'available' | 'missing' | 'no-exit' | 'unreachable';

// 단방향 엣지의 이동 방향을 지키며 출구에서 역탐색 (UI 검증용)
export const getNodeIdsThatCanReachExit = (graph?: FloorGraph | null) => {
  const reachableNodeIds = new Set<string>();
  if (!graph) return reachableNodeIds;

  const previousNodeIds = new Map<string, string[]>();
  const addPreviousNode = (nodeId: string, previousNodeId: string) => {
    const previousIds = previousNodeIds.get(nodeId) ?? [];
    previousIds.push(previousNodeId);
    previousNodeIds.set(nodeId, previousIds);
  };

  for (const edge of graph.edges) {
    addPreviousNode(edge.toNodeId, edge.fromNodeId);
    if (edge.bidirectional) addPreviousNode(edge.fromNodeId, edge.toNodeId);
  }

  const pendingNodeIds = graph.nodes.filter((node) => node.isExitTarget).map((node) => node.id);
  pendingNodeIds.forEach((nodeId) => reachableNodeIds.add(nodeId));

  for (let index = 0; index < pendingNodeIds.length; index += 1) {
    const nodeId = pendingNodeIds[index];
    if (!nodeId) continue;

    for (const previousNodeId of previousNodeIds.get(nodeId) ?? []) {
      if (reachableNodeIds.has(previousNodeId)) continue;
      reachableNodeIds.add(previousNodeId);
      pendingNodeIds.push(previousNodeId);
    }
  }

  return reachableNodeIds;
};

export const getStartCandidateStatus = (
  startNodeCount: number,
  exitTargetCount: number,
  reachableStartNodeCount: number,
): StartCandidateStatus => {
  if (startNodeCount === 0) return 'missing';
  if (exitTargetCount === 0) return 'no-exit';
  if (reachableStartNodeCount === 0) return 'unreachable';
  return 'available';
};
