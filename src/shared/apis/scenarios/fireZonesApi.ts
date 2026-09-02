import type { CreateFireZoneRequest, FireZoneResponse } from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface FireZone {
  id: string;
  scenarioId: string;
  floorId: string;
  gridCellId: string;
  isManualAdd: boolean;
  spreadGeneration: number;
  addedAt: string;
}

const toFireZone = (response: FireZoneResponse): FireZone => {
  const { id, scenarioId, floorId, gridCellId, addedAt } = response;

  if (!id || !scenarioId || !floorId || !gridCellId || !addedAt) {
    throw new Error('화재구역 응답에 필수 필드가 누락되었습니다.');
  }

  return {
    id,
    scenarioId,
    floorId,
    gridCellId,
    isManualAdd: response.isManualAdd ?? false,
    spreadGeneration: response.spreadGeneration ?? 0,
    addedAt,
  };
};

const getFireZoneList = async (url: string, signal?: AbortSignal) => {
  const response = await request<FireZoneResponse[]>({
    method: HTTP_METHOD.GET,
    url,
    signal,
    responseMode: 'raw',
  });

  return response.map(toFireZone);
};

export const getScenarioFireOrigin = (scenarioId: string, signal?: AbortSignal) =>
  getFireZoneList(API_ENDPOINTS.SCENARIOS.FIRE_ORIGIN(scenarioId), signal);

export const getScenarioFireZones = (scenarioId: string, signal?: AbortSignal) =>
  getFireZoneList(API_ENDPOINTS.SCENARIOS.FIRE_ZONES(scenarioId), signal);

export interface CreateFireOriginVariables {
  scenarioId: string;
  gridCellId: string;
}

// 도면관리에서 도면 그리드 셀을 클릭해 이 시나리오의 최초 발화점으로 등록
export const createFireOrigin = async ({
  scenarioId,
  gridCellId,
}: CreateFireOriginVariables): Promise<FireZone> => {
  const response = await request<FireZoneResponse, CreateFireZoneRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.SCENARIOS.FIRE_ZONES(scenarioId),
    body: { gridCellId },
    responseMode: 'raw',
  });

  return toFireZone(response);
};
