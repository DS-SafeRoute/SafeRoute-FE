import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateScenarioRequest } from '@apis/__generated__/data-contracts';

import { patchScenario } from './scenariosApi';
import { getScenarioQueryKey, SCENARIOS_QUERY_KEY } from './useScenariosQuery';

export const useUpdateScenarioMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scenarioId, body }: { scenarioId: string; body: UpdateScenarioRequest }) =>
      patchScenario(scenarioId, body),
    onSuccess: (scenario) => {
      queryClient.setQueryData(getScenarioQueryKey(scenario.id), scenario);
      void queryClient.invalidateQueries({ queryKey: SCENARIOS_QUERY_KEY, exact: true });
    },
  });
};
