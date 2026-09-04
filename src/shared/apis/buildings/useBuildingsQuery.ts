import { useQuery } from '@tanstack/react-query';

import { buildingQueryKeys } from './buildingQueryKeys';
import { getBuildings } from './buildingsApi';

export const useGetBuildingsQuery = () =>
  useQuery({
    queryKey: buildingQueryKeys.list(),
    queryFn: getBuildings,
  });
