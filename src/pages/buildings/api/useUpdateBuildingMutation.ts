import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateBuildingRequest } from '@apis/__generated__/data-contracts';

import { putBuilding } from './buildingsApi';
import { BUILDINGS_QUERY_KEY } from './useBuildingsQuery';

export const useUpdateBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ buildingId, body }: { buildingId: string; body: UpdateBuildingRequest }) =>
      putBuilding(buildingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDINGS_QUERY_KEY });
    },
  });
};
