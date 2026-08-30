import { useMutation, useQueryClient } from '@tanstack/react-query';

import { buildingQueryKeys } from '@apis/buildings/buildingQueryKeys';
import { deleteBuilding } from '@apis/buildings/buildingsApi';

export const useDeleteBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingQueryKeys.lists() });
    },
  });
};
