import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

import type {
  GenerateTrainingReportRequest,
  GenerateTrainingReportVariables,
  TrainingReportResponse,
} from './reportTypes';

export const postTrainingReport = ({ sessionId, body }: GenerateTrainingReportVariables) =>
  request<TrainingReportResponse, GenerateTrainingReportRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.TRAINING_REPORTS.CREATE(sessionId),
    body,
    responseMode: 'raw',
  });

export const getTrainingReport = (reportId: string, signal?: AbortSignal) =>
  request<TrainingReportResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.TRAINING_REPORTS.DETAIL(reportId),
    signal,
    responseMode: 'raw',
  });
