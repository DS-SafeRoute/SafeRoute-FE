import { useQuery } from '@tanstack/react-query';

import { getMyProfile } from './myProfileApi';

export const MY_PROFILE_QUERY_KEY = ['my-profile'] as const;

export const useMyProfileQuery = () => {
  return useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
  });
};
