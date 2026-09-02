import type {
  CreateMapNodeRequest,
  FloorGraphResponse,
  MapEdgeResponse,
  MapNodeResponse,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export type MapNodeType = 'STAIR' | 'ROOM' | 'HALLWAY' | 'DOOR' | 'EXIT' | 'START' | 'CUSTOM';

export interface MapNode {
  id: string;
  code: string;
  type: MapNodeType;
  name: string;
  x: number;
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

export const toMapNode = (response: MapNodeResponse): MapNode => {
  const { id, code, type, name, x, y } = response;
  if (!id || !code || !type || !name || x === undefined || y === undefined) {
    throw new Error('노드 응답에 필수 필드가 누락되었습니다.');
  }

  return { id, code, type, name, x, y, isExitTarget: response.isExitTarget ?? false };
};

export const toMapEdge = (response: MapEdgeResponse): MapEdge => {
  const { id, fromNodeId, toNodeId, distance, bidirectional } = response;
  if (!id || !fromNodeId || !toNodeId || distance === undefined || bidirectional === undefined) {
    throw new Error('엣지 응답에 필수 필드가 누락되었습니다.');
  }

  return { id, fromNodeId, toNodeId, distance, bidirectional };
};

export const getFloorGraph = async (floorId: string, signal?: AbortSignal): Promise<FloorGraph> => {
  const graph = await request<FloorGraphResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.MAP_GRAPH.DETAIL(floorId),
    signal,
  });

  return {
    nodes: (graph.nodes ?? []).map(toMapNode),
    edges: (graph.edges ?? []).map(toMapEdge),
  };
};

// 발화점 생성(fireZonesApi.ts)과 같은 이유로 여기 둠 — 도면관리상세뿐 아니라 시나리오설정에서도
// 시작 노드를 만들 때 이 함수를 그대로 씀(useStartNodeDesignation)
export const createMapNode = async (
  floorId: string,
  body: CreateMapNodeRequest,
): Promise<MapNode> => {
  const node = await request<MapNodeResponse, CreateMapNodeRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.MAP_GRAPH.CREATE_NODE(floorId),
    body,
  });
  return toMapNode(node);
};
