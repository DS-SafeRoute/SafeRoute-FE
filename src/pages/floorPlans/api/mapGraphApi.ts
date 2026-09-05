import type {
  CreateMapEdgeRequest,
  MapEdgeResponse,
  MapNodeResponse,
  UpdateMapNodePositionRequest,
} from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';
import { toMapEdge, toMapNode } from '@apis/floors/mapGraphApi';
import type { MapEdge, MapNode } from '@apis/floors/mapGraphApi';

export { createMapNode, getFloorGraph } from '@apis/floors/mapGraphApi';
export type { FloorGraph, MapEdge, MapNode, MapNodeType } from '@apis/floors/mapGraphApi';

export async function updateMapNodePosition(
  nodeId: string,
  body: UpdateMapNodePositionRequest,
): Promise<MapNode> {
  const node = await apiRequest<MapNodeResponse, UpdateMapNodePositionRequest>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.MAP_GRAPH.NODE(nodeId),
    body,
  });
  return toMapNode(node);
}

export async function deleteMapNode(nodeId: string): Promise<void> {
  await apiRequest<void>({
    method: HTTP_METHOD.DELETE,
    url: API_ENDPOINTS.MAP_GRAPH.NODE(nodeId),
  });
}

// DOOR 노드를 훈련 시작 후보로 지정/해제 (BE PR #225). 위치·타입은 안 건드리고 플래그만 토글.
// DOOR가 아닌 노드에 호출하면 서버가 EVAC012로 거부함.
export async function updateNodeStartCandidate(
  nodeId: string,
  isStartCandidate: boolean,
): Promise<MapNode> {
  const node = await apiRequest<MapNodeResponse, { isStartCandidate: boolean }>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.MAP_GRAPH.NODE_START_CANDIDATE(nodeId),
    body: { isStartCandidate },
  });
  return toMapNode(node);
}

export async function createMapEdge(body: CreateMapEdgeRequest): Promise<MapEdge> {
  const edge = await apiRequest<MapEdgeResponse, CreateMapEdgeRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.MAP_GRAPH.CREATE_EDGE,
    body,
  });
  return toMapEdge(edge);
}

export async function deleteMapEdge(edgeId: string): Promise<void> {
  await apiRequest<void>({
    method: HTTP_METHOD.DELETE,
    url: API_ENDPOINTS.MAP_GRAPH.EDGE(edgeId),
  });
}
