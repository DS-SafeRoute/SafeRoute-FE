import { useMutation, useQueryClient } from '@tanstack/react-query';

import { scenarioQueryKeys } from '@apis/scenarios/scenarioQueryKeys';

import { deleteScenario } from './scenariosApi';

export const useDeleteScenarioMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScenario,
    onSuccess: (_, scenarioId) => {
      queryClient.removeQueries({
        queryKey: scenarioQueryKeys.detail(scenarioId),
        exact: true,
      });
      void queryClient.invalidateQueries({
        queryKey: scenarioQueryKeys.all,
        exact: true,
      });
    },
  });
};
