import { useQuery } from '@tanstack/react-query';

import { getScenario, getScenarios } from './scenariosApi';

export const SCENARIOS_QUERY_KEY = ['scenarios'] as const;
export const getScenarioQueryKey = (scenarioId: string) =>
  [...SCENARIOS_QUERY_KEY, scenarioId] as const;

// 전체 시나리오 목록 조회
export const useGetScenariosQuery = () =>
  useQuery({
    queryKey: SCENARIOS_QUERY_KEY,
    queryFn: getScenarios,
  });

// 시나리오 상세 조회
export const useGetScenarioQuery = (scenarioId?: string) =>
  useQuery({
    queryKey: getScenarioQueryKey(scenarioId ?? ''),
    queryFn: () => {
      if (!scenarioId) throw new Error('시나리오 ID가 필요합니다.');
      return getScenario(scenarioId);
    },
    enabled: Boolean(scenarioId),
  });
