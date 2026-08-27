import type {
  CreateScenarioRequest,
  ScenarioResponse,
  UpdateScenarioRequest,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

import type { Scenario } from '../types/scenarioList';

const toScenario = (response: ScenarioResponse): Scenario => {
  const {
    id,
    name,
    buildingId,
    expectedParticipants,
    scheduledAt,
    fireSpreadSpeed,
    status,
    deletable,
    reportId,
  } = response;

  if (
    !id ||
    !name ||
    !buildingId ||
    expectedParticipants === undefined ||
    !scheduledAt ||
    !fireSpreadSpeed ||
    !status ||
    deletable === undefined
  ) {
    throw new Error('시나리오 응답에 필수 필드가 누락되었습니다.');
  }

  return {
    id,
    name,
    buildingId,
    expectedParticipants,
    scheduledAt,
    fireSpreadSpeed,
    status,
    deletable,
    reportId: reportId ?? null,
  };
};

export const getScenarios = async () => {
  const scenarios = await request<ScenarioResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.SCENARIOS.ROOT,
    responseMode: 'raw',
  });

  return scenarios.map(toScenario);
};

export const getScenario = async (scenarioId: string) => {
  const scenario = await request<ScenarioResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.SCENARIOS.DETAIL(scenarioId),
    responseMode: 'raw',
  });

  return toScenario(scenario);
};

export const postScenario = async (body: CreateScenarioRequest) => {
  const scenario = await request<ScenarioResponse, CreateScenarioRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.SCENARIOS.ROOT,
    body,
    responseMode: 'raw',
  });

  return toScenario(scenario);
};

export const patchScenario = async (scenarioId: string, body: UpdateScenarioRequest) => {
  const scenario = await request<ScenarioResponse, UpdateScenarioRequest>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.SCENARIOS.DETAIL(scenarioId),
    body,
    responseMode: 'raw',
  });

  return toScenario(scenario);
};

export const deleteScenario = (scenarioId: string) =>
  request<void>({
    method: HTTP_METHOD.DELETE,
    url: API_ENDPOINTS.SCENARIOS.DETAIL(scenarioId),
    responseMode: 'raw',
  });
