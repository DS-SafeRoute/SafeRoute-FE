import { useQuery } from '@tanstack/react-query';

import { getDashboardStats } from './dashboardApi';

export const DASHBOARD_STATS_QUERY_KEY = ['dashboard-stats'] as const;

export const useGetDashboardStatsQuery = () => {
  return useQuery({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: getDashboardStats,
  });
};
