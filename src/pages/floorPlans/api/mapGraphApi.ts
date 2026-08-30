import type {
  CreateMapEdgeRequest,
  CreateMapNodeRequest,
  MapEdgeResponse,
  MapNodeResponse,
  UpdateMapNodePositionRequest,
} from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';
import { toMapEdge, toMapNode } from '@apis/floors/mapGraphApi';
import type { MapEdge, MapNode } from '@apis/floors/mapGraphApi';

export { getFloorGraph } from '@apis/floors/mapGraphApi';
export type { FloorGraph, MapEdge, MapNode, MapNodeType } from '@apis/floors/mapGraphApi';

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
