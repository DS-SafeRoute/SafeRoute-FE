import { useMutation, useQueryClient } from '@tanstack/react-query';

import { scenarioQueryKeys } from '@apis/scenarios/scenarioQueryKeys';

import { postScenario } from './scenariosApi';

export const useCreateScenarioMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postScenario,
    onSuccess: (scenario) => {
      queryClient.setQueryData(scenarioQueryKeys.detail(scenario.id), scenario);
      void queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all, exact: true });
    },
  });
};
