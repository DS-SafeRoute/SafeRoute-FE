import { useQuery } from '@tanstack/react-query';

import { scenarioQueryKeys } from './scenarioQueryKeys';
import { getScenario, getScenarios } from './scenariosApi';

export const useGetScenariosQuery = () =>
  useQuery({
    queryKey: scenarioQueryKeys.list(),
    queryFn: getScenarios,
  });

export const useGetScenarioQuery = (scenarioId?: string) =>
  useQuery({
    queryKey: scenarioQueryKeys.detail(scenarioId ?? ''),
    queryFn: () => {
      if (!scenarioId) throw new Error('시나리오 ID가 필요합니다.');
      return getScenario(scenarioId);
    },
    enabled: Boolean(scenarioId),
  });
