import { useQuery } from '@tanstack/react-query';

import { getBuildings } from './buildingsApi';

export const useBuildingsQuery = () => {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: getBuildings,
  });
};
