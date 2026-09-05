import type {
  CreateMapNodeRequest,
  FloorGraphResponse,
  MapEdgeResponse,
  MapNodeResponse,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export type MapNodeType = NonNullable<MapNodeResponse['type']>;

export interface MapNode {
  id: string;
  code: string;
  type: MapNodeType;
  name: string;
  x: number;
  y: number;
  isExitTarget: boolean;
  /** DOOR 노드를 훈련 시작 후보로 지정했는지 (BE PR #225). START 타입 노드와 함께 시작점 후보로 인정됨 */
  isStartCandidate: boolean;
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

  return {
    id,
    code,
    type,
    name,
    x,
    y,
    isExitTarget: response.isExitTarget ?? false,
    // 생성된 타입이 아직 없어 loose하게 읽음(생성기 재실행 전까지)
    isStartCandidate:
      (response as MapNodeResponse & { isStartCandidate?: boolean }).isStartCandidate ?? false,
  };
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

// 도면 관리에서 START를 포함한 맵 노드를 등록
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
