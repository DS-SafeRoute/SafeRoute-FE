import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateBuildingRequest } from '@apis/__generated__/data-contracts';
import { buildingQueryKeys } from '@apis/buildings/buildingQueryKeys';
import { putBuilding } from '@apis/buildings/buildingsApi';

export const useUpdateBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ buildingId, body }: { buildingId: string; body: UpdateBuildingRequest }) =>
      putBuilding(buildingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingQueryKeys.lists() });
    },
  });
};
