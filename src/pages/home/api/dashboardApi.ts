import type {
  DashboardStatsResponse,
  RecentTrainingReportResponse,
} from '@apis/__generated__/data-contracts';
import axiosInstance from '@apis/config/axiosInstance';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export const getDashboardStats = async () => {
  const { data } = await axiosInstance.get<DashboardStatsResponse>(API_ENDPOINTS.DASHBOARD.STATS);

  return data;
};

export const getDashboardTrainings = async () => {
  const { data } = await axiosInstance.get<RecentTrainingReportResponse[]>(
    API_ENDPOINTS.DASHBOARD.RECENT_TRAININGS,
  );

  return data;
};

export const getTrainingStatus = async (sessionId: string) => {
  const { data } = await axiosInstance.get<string>(
    API_ENDPOINTS.DASHBOARD.TRAINING_STATUS(sessionId),
  );

  return data;
};
