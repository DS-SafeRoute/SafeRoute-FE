import { useQuery } from '@tanstack/react-query';

import { getScenarioFireZones } from './fireZonesApi';

export const fireZoneQueryKeys = {
  all: ['scenario-fire-zones'] as const,
  lists: () => [...fireZoneQueryKeys.all, 'list'] as const,
  list: (scenarioId?: string) => [...fireZoneQueryKeys.lists(), scenarioId] as const,
};

export const useScenarioFireZonesQuery = (scenarioId?: string, enabled = true) =>
  useQuery({
    queryKey: fireZoneQueryKeys.list(scenarioId),
    queryFn: ({ signal }) => {
      if (!scenarioId) throw new Error('화재구역을 조회할 시나리오 ID가 필요합니다.');
      return getScenarioFireZones(scenarioId, signal);
    },
    enabled: enabled && Boolean(scenarioId),
  });
