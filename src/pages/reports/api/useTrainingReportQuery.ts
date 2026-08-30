import { useQuery } from '@tanstack/react-query';

import { getTrainingReport } from './reportsApi';

export const trainingReportQueryKeys = {
  all: ['training-reports'] as const,
  detail: (reportId: string) => [...trainingReportQueryKeys.all, reportId] as const,
};

export const useTrainingReportQuery = (reportId?: string) =>
  useQuery({
    queryKey: trainingReportQueryKeys.detail(reportId ?? ''),
    queryFn: ({ signal }) => getTrainingReport(reportId as string, signal),
    enabled: Boolean(reportId),
  });
