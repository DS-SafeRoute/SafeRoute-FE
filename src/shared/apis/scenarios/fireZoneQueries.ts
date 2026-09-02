import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createFireOrigin, getScenarioFireOrigin, getScenarioFireZones } from './fireZonesApi';

export const fireZoneQueryKeys = {
  all: ['scenario-fire-zones'] as const,
  origins: () => [...fireZoneQueryKeys.all, 'origin'] as const,
  origin: (scenarioId?: string) => [...fireZoneQueryKeys.origins(), scenarioId] as const,
  lists: () => [...fireZoneQueryKeys.all, 'list'] as const,
  list: (scenarioId?: string) => [...fireZoneQueryKeys.lists(), scenarioId] as const,
};

export const useScenarioFireOriginQuery = (scenarioId?: string, enabled = true) =>
  useQuery({
    queryKey: fireZoneQueryKeys.origin(scenarioId),
    queryFn: ({ signal }) => {
      if (!scenarioId) throw new Error('최초 발화점을 조회할 시나리오 ID가 필요합니다.');
      return getScenarioFireOrigin(scenarioId, signal);
    },
    enabled: enabled && Boolean(scenarioId),
  });

export const useScenarioFireZonesQuery = (scenarioId?: string, enabled = true) =>
  useQuery({
    queryKey: fireZoneQueryKeys.list(scenarioId),
    queryFn: ({ signal }) => {
      if (!scenarioId) throw new Error('화재구역을 조회할 시나리오 ID가 필요합니다.');
      return getScenarioFireZones(scenarioId, signal);
    },
    enabled: enabled && Boolean(scenarioId),
  });

export const useCreateFireOriginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFireOrigin,
    onSuccess: (fireZone) => {
      void queryClient.invalidateQueries({
        queryKey: fireZoneQueryKeys.origin(fireZone.scenarioId),
      });
      void queryClient.invalidateQueries({ queryKey: fireZoneQueryKeys.list(fireZone.scenarioId) });
    },
  });
};
