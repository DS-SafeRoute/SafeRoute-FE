import { SCENARIO_STATUS } from '@pages/scenarioSettings/types/scenarioList';
import type { Scenario } from '@pages/scenarioSettings/types/scenarioList';

import type {
  CreateScenarioRequest,
  UpdateScenarioRequest,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

const FIRE_SPREAD_SPEEDS = ['SLOW', 'MEDIUM', 'FAST'] as const;
const SCENARIO_STATUSES = Object.values(SCENARIO_STATUS);

const isFireSpreadSpeed = (value: unknown): value is Scenario['fireSpreadSpeed'] =>
  typeof value === 'string' && FIRE_SPREAD_SPEEDS.some((speed) => speed === value);

const isScenarioStatus = (value: unknown): value is Scenario['status'] =>
  typeof value === 'string' && SCENARIO_STATUSES.some((status) => status === value);

const toScenario = (response: unknown): Scenario => {
  if (typeof response !== 'object' || response === null) {
    throw new Error('시나리오 응답 형식이 올바르지 않습니다.');
  }

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
    startNodeId,
  } = response as Record<string, unknown>;

  if (
    typeof id !== 'string' ||
    !id ||
    typeof name !== 'string' ||
    !name ||
    typeof buildingId !== 'string' ||
    !buildingId ||
    typeof expectedParticipants !== 'number' ||
    !Number.isInteger(expectedParticipants) ||
    typeof scheduledAt !== 'string' ||
    Number.isNaN(Date.parse(scheduledAt)) ||
    !isFireSpreadSpeed(fireSpreadSpeed) ||
    !isScenarioStatus(status) ||
    (typeof deletable !== 'boolean' && deletable !== null) ||
    (reportId !== undefined && reportId !== null && typeof reportId !== 'string') ||
    (startNodeId !== undefined && startNodeId !== null && typeof startNodeId !== 'string')
  ) {
    throw new Error('시나리오 응답 필드가 올바르지 않습니다.');
  }

  return {
    id,
    name,
    buildingId,
    expectedParticipants,
    scheduledAt,
    fireSpreadSpeed,
    status,
    deletable: deletable ?? false,
    reportId: reportId ?? null,
    startNodeId: startNodeId ?? null,
  };
};

export const getScenarios = async () => {
  const scenarios = await request<unknown>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.SCENARIOS.ROOT,
    responseMode: 'raw',
  });

  if (!Array.isArray(scenarios)) {
    throw new Error('시나리오 목록 응답 형식이 올바르지 않습니다.');
  }

  return scenarios.map(toScenario);
};

export const getScenario = async (scenarioId: string) => {
  const scenario = await request<unknown>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.SCENARIOS.DETAIL(scenarioId),
    responseMode: 'raw',
  });

  return toScenario(scenario);
};

export const postScenario = async (body: CreateScenarioRequest) => {
  const scenario = await request<unknown, CreateScenarioRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.SCENARIOS.ROOT,
    body,
    responseMode: 'raw',
  });

  return toScenario(scenario);
};

export const patchScenario = async (scenarioId: string, body: UpdateScenarioRequest) => {
  const scenario = await request<unknown, UpdateScenarioRequest>({
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
