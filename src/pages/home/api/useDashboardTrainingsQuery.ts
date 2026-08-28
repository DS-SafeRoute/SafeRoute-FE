import { useQuery } from '@tanstack/react-query';

import { dashboardQueryKeys } from '@apis/dashboard/dashboardQueryKeys';

import { getDashboardTrainings } from './dashboardApi';

export const useGetDashboardTrainingsQuery = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.recentTrainings(),
    queryFn: getDashboardTrainings,
  });
};
