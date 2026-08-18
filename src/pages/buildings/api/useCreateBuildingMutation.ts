import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postBuilding } from './buildingsApi';
import { BUILDINGS_QUERY_KEY } from './useBuildingsQuery';

export const useCreateBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDINGS_QUERY_KEY });
    },
  });
};
