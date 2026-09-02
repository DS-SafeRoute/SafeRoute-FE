import { useQuery } from '@tanstack/react-query';

import { getScenarioFireOrigin, getScenarioFireZones } from './fireZonesApi';

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

// 발화점 등록 mutation(useCreateFireOriginMutation)은 백엔드에서 POST 엔드포인트 자체가
// 제거되어(evacuation-setup으로 통합된 것으로 보임, fireZonesApi.ts 주석 참고) 지웠음
