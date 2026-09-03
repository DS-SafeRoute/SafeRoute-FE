import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateScenarioDraftRequest,
  UpdateScenarioRequest,
} from '@apis/__generated__/data-contracts';
import { scenarioQueryKeys } from '@apis/scenarios/scenarioQueryKeys';

import {
  deleteScenario,
  getScenario,
  getScenarios,
  patchScenario,
  postReadyScenario,
  postScenarioDraft,
} from './scenariosApi';

// 시나리오 목록 조회
export const useGetScenariosQuery = () =>
  useQuery({
    queryKey: scenarioQueryKeys.all,
    queryFn: getScenarios,
  });

// 시나리오 상세 조회
export const useGetScenarioQuery = (scenarioId?: string) =>
  useQuery({
    queryKey: scenarioQueryKeys.detail(scenarioId),
    queryFn: () => {
      if (!scenarioId) throw new Error('시나리오 ID가 필요합니다.');
      return getScenario(scenarioId);
    },
    enabled: Boolean(scenarioId),
  });

// 시나리오 임시 저장 생성
export const useCreateScenarioDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateScenarioDraftRequest) => postScenarioDraft(body),
    onSuccess: (scenario) => {
      queryClient.setQueryData(scenarioQueryKeys.detail(scenario.id), scenario);
      void queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all, exact: true });
    },
  });
};

// 시나리오 작성 완료(DRAFT → READY)
export const useReadyScenarioMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postReadyScenario,
    onSuccess: (scenario) => {
      queryClient.setQueryData(scenarioQueryKeys.detail(scenario.id), scenario);
      void queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all, exact: true });
    },
  });
};

// 시나리오 수정
export const useUpdateScenarioMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scenarioId, body }: { scenarioId: string; body: UpdateScenarioRequest }) =>
      patchScenario(scenarioId, body),
    onSuccess: (scenario) => {
      queryClient.setQueryData(scenarioQueryKeys.detail(scenario.id), scenario);
      void queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all, exact: true });
    },
  });
};

// 시나리오 삭제
export const useDeleteScenarioMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScenario,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all, exact: true }),
  });
};
