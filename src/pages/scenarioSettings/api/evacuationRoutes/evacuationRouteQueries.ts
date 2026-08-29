import { useQuery } from '@tanstack/react-query';

import { getEvacuationRoute } from './evacuationRoutesApi';

import type { GetEvacuationRouteParams } from './evacuationRoutesApi';

export const evacuationRouteQueryKeys = {
  all: ['evacuation-routes'] as const,
  details: () => [...evacuationRouteQueryKeys.all, 'detail'] as const,
  detail: (params?: Partial<GetEvacuationRouteParams>) =>
    [...evacuationRouteQueryKeys.details(), params] as const,
};

export const useEvacuationRouteQuery = (params?: GetEvacuationRouteParams, enabled = true) =>
  useQuery({
    queryKey: evacuationRouteQueryKeys.detail(params),
    queryFn: ({ signal }) => {
      if (!params) throw new Error('대피 경로 조회 조건이 필요합니다.');
      return getEvacuationRoute(params, signal);
    },
    enabled: enabled && Boolean(params),
  });
