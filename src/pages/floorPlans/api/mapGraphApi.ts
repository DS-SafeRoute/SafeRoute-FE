import type {
  CreateMapEdgeRequest,
  CreateMapNodeRequest,
  FloorGraphResponse,
  MapEdgeResponse,
  MapNodeResponse,
  UpdateMapNodePositionRequest,
} from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export type MapNodeType = 'STAIR' | 'ROOM' | 'HALLWAY' | 'DOOR' | 'EXIT' | 'CUSTOM';

export interface MapNode {
  id: string;
  code: string;
  type: MapNodeType;
  name: string;
  /** 0~1 비율 좌표 */
  x: number;
  /** 0~1 비율 좌표 */
  y: number;
  isExitTarget: boolean;
}

export interface MapEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distance: number;
  bidirectional: boolean;
}

export interface FloorGraph {
  nodes: MapNode[];
  edges: MapEdge[];
}

const toMapNode = (response: MapNodeResponse): MapNode => {
  const { id, code, type, name, x, y } = response;
  if (!id || !code || !type || !name || x === undefined || y === undefined) {
    throw new Error('노드 응답에 필수 필드가 누락되었습니다.');
  }
  return { id, code, type, name, x, y, isExitTarget: response.isExitTarget ?? false };
};

const toMapEdge = (response: MapEdgeResponse): MapEdge => {
  const { id, fromNodeId, toNodeId, distance, bidirectional } = response;
  if (!id || !fromNodeId || !toNodeId || distance === undefined || bidirectional === undefined) {
    throw new Error('엣지 응답에 필수 필드가 누락되었습니다.');
  }
  return { id, fromNodeId, toNodeId, distance, bidirectional };
};

export async function getFloorGraph(floorId: string): Promise<FloorGraph> {
  const graph = await apiRequest<FloorGraphResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.MAP_GRAPH.DETAIL(floorId),
  });
  return {
    nodes: (graph.nodes ?? []).map(toMapNode),
    edges: (graph.edges ?? []).map(toMapEdge),
  };
}

export async function createMapNode(floorId: string, body: CreateMapNodeRequest): Promise<MapNode> {
  const node = await apiRequest<MapNodeResponse, CreateMapNodeRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.MAP_GRAPH.CREATE_NODE(floorId),
    body,
  });
  return toMapNode(node);
}

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
