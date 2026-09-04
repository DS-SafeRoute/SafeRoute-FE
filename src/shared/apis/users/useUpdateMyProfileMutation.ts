import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchMyProfile } from './myProfileApi';
import { MY_PROFILE_QUERY_KEY } from './useMyProfileQuery';

export const useUpdateMyProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchMyProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(MY_PROFILE_QUERY_KEY, profile);
    },
  });
};
