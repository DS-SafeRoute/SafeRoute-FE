import { useQuery } from '@tanstack/react-query';

import { getScenarioFireZones } from './fireZonesApi';

const RUNNING_FIRE_ZONE_REFETCH_INTERVAL_MS = 10_000;

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
    // 웹소켓 이벤트 누락·재연결 구간에도 확산 상태가 복구되도록 RUNNING에서만 보조 폴링한다.
    refetchInterval: enabled ? RUNNING_FIRE_ZONE_REFETCH_INTERVAL_MS : false,
  });
