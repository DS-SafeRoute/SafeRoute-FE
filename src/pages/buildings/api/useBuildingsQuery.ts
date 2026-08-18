import { useQuery } from '@tanstack/react-query';

import { getBuildings } from './buildingsApi';

export const BUILDINGS_QUERY_KEY = ['buildings'] as const;

export const useGetBuildingsQuery = () => {
  return useQuery({
    queryKey: BUILDINGS_QUERY_KEY,
    queryFn: getBuildings,
  });
};
