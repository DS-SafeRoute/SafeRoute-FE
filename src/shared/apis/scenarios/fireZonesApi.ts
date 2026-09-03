import type { FireZoneResponse } from '@apis/__generated__/data-contracts';
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

export const getScenarioFireZones = (scenarioId: string, signal?: AbortSignal) =>
  getFireZoneList(API_ENDPOINTS.SCENARIOS.FIRE_ZONES(scenarioId), signal);

// 발화점 등록은 evacuation-setup으로 통합되었고, 이 조회는 훈련 중 확산 셀 표시에만 사용한다.
