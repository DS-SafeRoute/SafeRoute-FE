import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteBuilding } from './buildingsApi';

export const useDeleteBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
};
