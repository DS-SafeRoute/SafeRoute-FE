import type { HomeTrainingStatusResponse } from '@pages/home/types/home';

import type {
  DashboardStatsResponse,
  RecentTrainingReportResponse,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

// 대시보드 요약 통계 조회
export const getDashboardStats = () =>
  request<DashboardStatsResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.DASHBOARD.STATS,
  });

// 최근 훈련 리포트 목록 조회
export const getDashboardTrainings = () =>
  request<RecentTrainingReportResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.DASHBOARD.RECENT_TRAININGS,
  });

// 세션별 홈 훈련 상태 상세 조회
export const getTrainingStatus = (sessionId: string) =>
  request<HomeTrainingStatusResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.DASHBOARD.TRAINING_STATUS(sessionId),
  });
