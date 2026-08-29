import { useQuery } from '@tanstack/react-query';

import { dashboardQueryKeys } from '@apis/dashboard/dashboardQueryKeys';

import { getDashboardStats } from './dashboardApi';

export const useGetDashboardStatsQuery = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.stats(),
    queryFn: getDashboardStats,
  });
};
