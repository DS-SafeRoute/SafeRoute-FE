import { useQuery } from '@tanstack/react-query';

import { getDashboardTrainings } from './dashboardApi';

export const DASHBOARD_TRAININGS_QUERY_KEY = ['dashboard-trainings'] as const;

export const useGetDashboardTrainingsQuery = () => {
  return useQuery({
    queryKey: DASHBOARD_TRAININGS_QUERY_KEY,
    queryFn: getDashboardTrainings,
  });
};
