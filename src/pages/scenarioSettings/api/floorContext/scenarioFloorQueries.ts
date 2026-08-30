import { useQuery, useQueryClient } from '@tanstack/react-query';

import { buildingFloorsQueryOptions, floorGraphQueryOptions } from '@apis/floors/floorQueries';

interface ScenarioFloorParams {
  buildingId: string;
  startNodeId: string;
}

export const scenarioFloorQueryKeys = {
  all: ['scenario-floor'] as const,
  details: () => [...scenarioFloorQueryKeys.all, 'detail'] as const,
  detail: (params?: Partial<ScenarioFloorParams>) =>
    [...scenarioFloorQueryKeys.details(), params] as const,
};

export const useScenarioFloorQuery = (params?: ScenarioFloorParams, enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: scenarioFloorQueryKeys.detail(params),
    queryFn: async () => {
      if (!params) throw new Error('시나리오 층 조회 조건이 필요합니다.');

      const floors = await queryClient.fetchQuery(buildingFloorsQueryOptions(params.buildingId));
      const floorGraphs = await Promise.all(
        floors.map(async (floor) => ({
          floor,
          graph: await queryClient.fetchQuery(floorGraphQueryOptions(floor.id)),
        })),
      );

      return (
        floorGraphs.find(({ graph }) =>
          graph.nodes.some((node) => node.id === params.startNodeId),
        ) ?? null
      );
    },
    enabled: enabled && Boolean(params),
  });
};
