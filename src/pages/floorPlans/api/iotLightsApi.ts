import type {
  AssignCctvRequest,
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
import { toIoTLight } from '@apis/floors/iotLightsApi';
import type { IoTLight } from '@apis/floors/iotLightsApi';

export { getFloorLights } from '@apis/floors/iotLightsApi';
export type { IoTLight } from '@apis/floors/iotLightsApi';

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

// 삭제 시 이 유도등이 붙어있던 노드와 연결 엣지까지 서버에서 cascade로 함께 삭제됨(백엔드 확인, 2026-08-27)
export async function deleteIoTLight(lightId: string): Promise<void> {
  await apiRequest<void>({
    method: HTTP_METHOD.DELETE,
    url: API_ENDPOINTS.IOT_LIGHTS.DETAIL(lightId),
  });
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

// 유도등이 대피 흐름을 참고할 담당 CCTV 배정 — 같은 층 CCTV만 유효(백엔드 검증)
export async function assignLightCctv(lightId: string, cctvId: string): Promise<IoTLight> {
  const light = await apiRequest<IoTLightResponse, AssignCctvRequest>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.IOT_LIGHTS.CCTV(lightId),
    body: { cctvId },
  });
  return toIoTLight(light);
}
