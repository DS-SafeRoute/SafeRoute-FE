import type {
  DashboardStatsResponse,
  RecentTrainingReportResponse,
  TrainingStatusResponse,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export const getDashboardStats = () =>
  request<DashboardStatsResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.DASHBOARD.STATS,
  });

export const getDashboardTrainings = () =>
  request<RecentTrainingReportResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.DASHBOARD.RECENT_TRAININGS,
  });

export const getTrainingStatus = (sessionId: string) =>
  request<TrainingStatusResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.DASHBOARD.TRAINING_STATUS(sessionId),
  });
