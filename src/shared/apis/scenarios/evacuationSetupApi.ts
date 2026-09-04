import type {
  CreateScenarioEvacuationSetupRequest,
  ScenarioEvacuationSetupResponse,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

// 시나리오 설정 화면 재진입 시 발화점 + 훈련 시작점을 한 번에 조회(스웨거 설명 원문)
export const getScenarioEvacuationSetup = async (
  scenarioId: string,
  signal?: AbortSignal,
): Promise<ScenarioEvacuationSetupResponse> =>
  request<ScenarioEvacuationSetupResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.SCENARIOS.EVACUATION_SETUP(scenarioId),
    signal,
    responseMode: 'raw',
  });

export interface PostEvacuationSetupVariables extends CreateScenarioEvacuationSetupRequest {
  scenarioId: string;
}

// 사용자가 고른 최초 발화점(fireOriginGridCellId)과 훈련 시작점(startNodeId)을 하나의 요청,
// 하나의 트랜잭션으로 함께 저장(스웨거 설명 원문) — 스키마상 둘 다 required라 하나만 보낼 수 없음
export const postScenarioEvacuationSetup = async ({
  scenarioId,
  fireOriginGridCellId,
  startNodeId,
}: PostEvacuationSetupVariables): Promise<ScenarioEvacuationSetupResponse> =>
  request<ScenarioEvacuationSetupResponse, CreateScenarioEvacuationSetupRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.SCENARIOS.EVACUATION_SETUP(scenarioId),
    body: { fireOriginGridCellId, startNodeId },
    responseMode: 'raw',
  });
