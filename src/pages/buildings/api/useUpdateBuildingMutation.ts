import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateBuildingRequest } from '@apis/__generated__/data-contracts';

import { updateBuilding } from './buildingsApi';

export const useUpdateBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ buildingId, body }: { buildingId: string; body: UpdateBuildingRequest }) =>
      updateBuilding(buildingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
};
