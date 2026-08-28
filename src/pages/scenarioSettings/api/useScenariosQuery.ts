import { useQuery } from '@tanstack/react-query';

import { scenarioQueryKeys } from '@apis/scenarios/scenarioQueryKeys';

import { getScenario, getScenarios } from './scenariosApi';

// 전체 시나리오 목록 조회
export const useGetScenariosQuery = () =>
  useQuery({
    queryKey: scenarioQueryKeys.all,
    queryFn: getScenarios,
  });

// 시나리오 상세 조회
export const useGetScenarioQuery = (scenarioId?: string) =>
  useQuery({
    queryKey: scenarioQueryKeys.detail(scenarioId ?? ''),
    queryFn: () => {
      if (!scenarioId) throw new Error('시나리오 ID가 필요합니다.');
      return getScenario(scenarioId);
    },
    enabled: Boolean(scenarioId),
  });
