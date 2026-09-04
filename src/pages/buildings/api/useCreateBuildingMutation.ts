import { useMutation, useQueryClient } from '@tanstack/react-query';

import { buildingQueryKeys } from '@apis/buildings/buildingQueryKeys';
import { postBuilding } from '@apis/buildings/buildingsApi';

export const useCreateBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingQueryKeys.lists() });
    },
  });
};
