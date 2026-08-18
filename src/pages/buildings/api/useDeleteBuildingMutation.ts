import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteBuilding } from './buildingsApi';
import { BUILDINGS_QUERY_KEY } from './useBuildingsQuery';

export const useDeleteBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDINGS_QUERY_KEY });
    },
  });
};
