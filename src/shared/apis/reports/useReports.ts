import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { dashboardQueryKeys } from '@apis/dashboard/dashboardQueryKeys';
import { scenarioQueryKeys } from '@apis/scenarios/scenarioQueryKeys';

import { reportQueryKeys } from './reportQueryKeys';
import { getTrainingReport, postTrainingReport } from './reportsApi';

export const useTrainingReportQuery = (reportId?: string) =>
  useQuery({
    queryKey: reportQueryKeys.detail(reportId ?? ''),
    queryFn: ({ signal }) => {
      if (!reportId) throw new Error('리포트 ID가 필요합니다.');
      return getTrainingReport(reportId, signal);
    },
    enabled: Boolean(reportId),
  });

export const useGenerateTrainingReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTrainingReport,
    onSuccess: (report) => {
      if (report.reportId) {
        queryClient.setQueryData(reportQueryKeys.detail(report.reportId), report);
      }
      void queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.recentTrainings(),
        refetchType: 'all',
      });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.stats() });
    },
  });
};
