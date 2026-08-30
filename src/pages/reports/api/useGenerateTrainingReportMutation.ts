import { useMutation } from '@tanstack/react-query';

import { postTrainingReport } from './reportsApi';

export const useGenerateTrainingReportMutation = () =>
  useMutation({
    mutationFn: postTrainingReport,
  });
