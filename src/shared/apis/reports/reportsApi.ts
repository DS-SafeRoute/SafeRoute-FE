import type { GenerateReportRequest, ReportResponse } from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

interface GenerateTrainingReportVariables {
  sessionId: string;
  body: GenerateReportRequest;
}

export const postTrainingReport = ({ sessionId, body }: GenerateTrainingReportVariables) =>
  request<ReportResponse, GenerateReportRequest>({
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
