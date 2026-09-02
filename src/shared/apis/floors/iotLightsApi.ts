import type { IoTLightResponse } from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface IoTLight {
  id: string;
  code: string;
  name: string;
  floorId: string;
  x: number;
  y: number;
  enabled: boolean;
  guidanceConfigured: boolean;
  decisionNodeId: string | null;
  leftEdgeId: string | null;
  rightEdgeId: string | null;
  piEndpoint: string | null;
  /** 이 유도등이 대피 흐름을 참고할 담당 CCTV. 미배정이면 null */
  cctvId: string | null;
}

export const toIoTLight = (response: IoTLightResponse): IoTLight => {
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
    cctvId: response.cctvId ?? null,
  };
};

export const getFloorLights = async (floorId: string, signal?: AbortSignal) => {
  const lights = await request<IoTLightResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.IOT_LIGHTS.ROOT,
    query: { floorId },
    signal,
  });

  return lights.map(toIoTLight);
};
