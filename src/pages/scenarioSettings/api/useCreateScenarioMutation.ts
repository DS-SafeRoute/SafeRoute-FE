import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postScenario } from './scenariosApi';
import { getScenarioQueryKey, SCENARIOS_QUERY_KEY } from './useScenariosQuery';

export const useCreateScenarioMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postScenario,
    onSuccess: (scenario) => {
      queryClient.setQueryData(getScenarioQueryKey(scenario.id), scenario);
      void queryClient.invalidateQueries({ queryKey: SCENARIOS_QUERY_KEY, exact: true });
    },
  });
};
