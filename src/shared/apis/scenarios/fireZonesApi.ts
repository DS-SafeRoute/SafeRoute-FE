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

export const getScenarioFireOrigin = (scenarioId: string, signal?: AbortSignal) =>
  getFireZoneList(API_ENDPOINTS.SCENARIOS.FIRE_ORIGIN(scenarioId), signal);

export const getScenarioFireZones = (scenarioId: string, signal?: AbortSignal) =>
  getFireZoneList(API_ENDPOINTS.SCENARIOS.FIRE_ZONES(scenarioId), signal);

// 발화점 등록(POST /scenarios/{scenarioId}/fire-zones)은 백엔드에서 완전히 제거됨(팀 전달사항,
// 2026-09-03) — 대신 POST /scenarios/{scenarioId}/evacuation-setup로 통합된 것으로 보임(스웨거
// 확인, 화재 설정이 그쪽에 포함됨). 여기 있던 createFireOrigin/useCreateFireOriginMutation은
// 이제 존재하지 않는 엔드포인트를 호출하던 코드라 지움 — 새 등록 플로우는 evacuation-setup
// 기준으로 다시 만들어야 함. 조회(GET fire-origin/fire-zones)는 그대로 살아있어 안 건드림
