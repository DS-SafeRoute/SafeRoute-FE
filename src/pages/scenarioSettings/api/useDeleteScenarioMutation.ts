import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteScenario } from './scenariosApi';
import { SCENARIOS_QUERY_KEY } from './useScenariosQuery';

export const useDeleteScenarioMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScenario,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCENARIOS_QUERY_KEY });
    },
  });
};
