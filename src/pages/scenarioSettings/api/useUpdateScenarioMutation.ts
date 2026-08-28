import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateScenarioRequest } from '@apis/__generated__/data-contracts';
import { scenarioQueryKeys } from '@apis/scenarios/scenarioQueryKeys';

import { patchScenario } from './scenariosApi';

export const useUpdateScenarioMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scenarioId, body }: { scenarioId: string; body: UpdateScenarioRequest }) =>
      patchScenario(scenarioId, body),
    onSuccess: (scenario) => {
      queryClient.setQueryData(scenarioQueryKeys.detail(scenario.id), scenario);
      void queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all, exact: true });
    },
  });
};
