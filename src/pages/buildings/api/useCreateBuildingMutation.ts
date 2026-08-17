import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBuilding } from './buildingsApi';

export const useCreateBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
};
