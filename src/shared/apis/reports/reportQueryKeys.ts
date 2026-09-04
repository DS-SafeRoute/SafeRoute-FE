export const reportQueryKeys = {
  all: ['training-reports'] as const,
  details: () => [...reportQueryKeys.all, 'detail'] as const,
  detail: (reportId: string) => [...reportQueryKeys.details(), reportId] as const,
};
