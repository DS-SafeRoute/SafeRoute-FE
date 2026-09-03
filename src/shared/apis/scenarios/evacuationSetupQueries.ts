import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getScenarioEvacuationSetup, setScenarioEvacuationSetup } from './evacuationSetupApi';

export const evacuationSetupQueryKeys = {
  all: ['scenario-evacuation-setup'] as const,
  detail: (scenarioId?: string) => [...evacuationSetupQueryKeys.all, scenarioId] as const,
};

export const useGetScenarioEvacuationSetupQuery = (scenarioId?: string, enabled = true) =>
  useQuery({
    queryKey: evacuationSetupQueryKeys.detail(scenarioId),
    queryFn: ({ signal }) => {
      if (!scenarioId) throw new Error('발화점·시작점을 조회할 시나리오 ID가 필요합니다.');
      return getScenarioEvacuationSetup(scenarioId, signal);
    },
    enabled: enabled && Boolean(scenarioId),
  });

export const useSetEvacuationSetupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setScenarioEvacuationSetup,
    onSuccess: (setup, variables) => {
      const scenarioId = setup.scenarioId ?? variables.scenarioId;
      queryClient.setQueryData(evacuationSetupQueryKeys.detail(scenarioId), setup);
    },
  });
};
