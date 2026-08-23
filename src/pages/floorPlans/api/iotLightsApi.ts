import type {
  CreateIoTLightRequest,
  IoTLightResponse,
  UpdateIoTLightRequest,
} from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface IoTLight {
  id: string;
  code: string;
  name: string;
  floorId: string;
  /** 0~1 비율 좌표 */
  x: number;
  /** 0~1 비율 좌표 */
  y: number;
  enabled: boolean;
  guidanceConfigured: boolean;
  decisionNodeId: string | null;
  leftEdgeId: string | null;
  rightEdgeId: string | null;
}

const toIoTLight = (response: IoTLightResponse): IoTLight => {
  const { id, code, name, floorId, x, y } = response;
  if (!id || !code || !name || !floorId || x === undefined || y === undefined) {
    throw new Error('유도등 응답에 필수 필드가 누락되었습니다.');
  }
  return {
    id,
    code,
    name,
    floorId,
    x,
    y,
    enabled: response.enabled ?? false,
    guidanceConfigured: response.guidanceConfigured ?? false,
    decisionNodeId: response.decisionNodeId ?? null,
    leftEdgeId: response.leftEdgeId ?? null,
    rightEdgeId: response.rightEdgeId ?? null,
  };
};

export async function getFloorLights(floorId: string): Promise<IoTLight[]> {
  const lights = await apiRequest<IoTLightResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.IOT_LIGHTS.ROOT,
    query: { floorId },
  });
  return lights.map(toIoTLight);
}

export async function createIoTLight(body: CreateIoTLightRequest): Promise<IoTLight> {
  const light = await apiRequest<IoTLightResponse, CreateIoTLightRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.IOT_LIGHTS.ROOT,
    body,
  });
  return toIoTLight(light);
}

export async function updateIoTLight(
  lightId: string,
  body: UpdateIoTLightRequest,
): Promise<IoTLight> {
  const light = await apiRequest<IoTLightResponse, UpdateIoTLightRequest>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.IOT_LIGHTS.DETAIL(lightId),
    body,
  });
  return toIoTLight(light);
}
