import type {
  ChangeLightDirectionRequest,
  ConfigureGuidanceRequest,
  CreateIoTLightRequest,
  IoTLightResponse,
  LightDirectionResponse,
  UpdateIoTLightRequest,
  UpdatePiEndpointRequest,
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
  piEndpoint: string | null;
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
    piEndpoint: response.piEndpoint ?? null,
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

export async function enableIoTLight(lightId: string): Promise<IoTLight> {
  const light = await apiRequest<IoTLightResponse>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.IOT_LIGHTS.ENABLE(lightId),
  });
  return toIoTLight(light);
}

export async function disableIoTLight(lightId: string): Promise<IoTLight> {
  const light = await apiRequest<IoTLightResponse>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.IOT_LIGHTS.DISABLE(lightId),
  });
  return toIoTLight(light);
}

export interface LightDirection {
  lightId: string;
  direction: 'LEFT' | 'RIGHT' | 'OFF' | 'BOTH';
  updatedAt: string;
}

export async function changeLightDirection(
  lightId: string,
  direction: 'LEFT' | 'RIGHT' | 'OFF' | 'BOTH',
): Promise<LightDirection> {
  const response = await apiRequest<LightDirectionResponse, ChangeLightDirectionRequest>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.IOT_LIGHTS.DIRECTION(lightId),
    body: { direction },
  });
  const { lightId: id, direction: dir, updatedAt } = response;
  if (!id || !dir || !updatedAt) {
    throw new Error('유도등 방향 응답에 필수 필드가 누락되었습니다.');
  }
  return { lightId: id, direction: dir, updatedAt };
}

export async function configureLightGuidance(
  lightId: string,
  body: ConfigureGuidanceRequest,
): Promise<IoTLight> {
  const light = await apiRequest<IoTLightResponse, ConfigureGuidanceRequest>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.IOT_LIGHTS.GUIDANCE(lightId),
    body,
  });
  return toIoTLight(light);
}

export async function updateLightPiEndpoint(
  lightId: string,
  piEndpoint: string,
): Promise<IoTLight> {
  const light = await apiRequest<IoTLightResponse, UpdatePiEndpointRequest>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.IOT_LIGHTS.PI_ENDPOINT(lightId),
    body: { piEndpoint },
  });
  return toIoTLight(light);
}
