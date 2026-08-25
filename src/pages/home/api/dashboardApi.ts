import type { DashboardStatsResponse } from '@apis/__generated__/data-contracts';
import axiosInstance from '@apis/config/axiosInstance';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface DashboardTrainingResponse {
  scenarioName?: string;
  startedAt?: string;
  participantCount?: number;
  avgEvacuationSec?: number;
  survivalRate?: number;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
}

export const getDashboardStats = async () => {
  const { data } = await axiosInstance.get<DashboardStatsResponse>(API_ENDPOINTS.DASHBOARD.STATS);

  return data;
};

export const getDashboardTrainings = async () => {
  const { data } = await axiosInstance.get<DashboardTrainingResponse[]>(
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
