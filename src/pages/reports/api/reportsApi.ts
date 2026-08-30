import type { ReportResponse } from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface GenerateTrainingReportVariables {
  sessionId: string;
  body: GenerateTrainingReportRequest;
}

export interface GenerateTrainingReportRequest {
  participantCount: number;
  survivorCount: number;
}

export const postTrainingReport = ({ sessionId, body }: GenerateTrainingReportVariables) =>
  request<ReportResponse, GenerateTrainingReportRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.TRAINING_REPORTS.CREATE(sessionId),
    body,
    responseMode: 'raw',
  });

export const getTrainingReport = (reportId: string, signal?: AbortSignal) =>
  request<ReportResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.TRAINING_REPORTS.DETAIL(reportId),
    signal,
    responseMode: 'raw',
  });
