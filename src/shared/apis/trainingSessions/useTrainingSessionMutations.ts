import { useMutation, useQueryClient } from '@tanstack/react-query';

import { scenarioQueryKeys } from '@apis/scenarios/scenarioQueryKeys';

import { trainingSessionQueryKeys } from './trainingSessionQueryKeys';
import {
  createTrainingSession,
  endTrainingSession,
  forceEndTrainingSession,
  startTrainingSession,
} from './trainingSessionsApi';

// 세션 상태 변경 후 세션·홈 상태·시나리오 캐시 갱신
const useInvalidateTrainingSessionQueries = () => {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: trainingSessionQueryKeys.lists(),
      }),
      queryClient.invalidateQueries({
        queryKey: trainingSessionQueryKeys.statuses(),
      }),
      queryClient.invalidateQueries({
        queryKey: scenarioQueryKeys.all,
      }),
    ]);
};

// 훈련 세션 등록 Mutation
export const useCreateTrainingSessionMutation = () => {
  const invalidateQueries = useInvalidateTrainingSessionQueries();

  return useMutation({
    mutationFn: createTrainingSession,
    onSuccess: invalidateQueries,
  });
};

// 훈련 세션 시작 Mutation
export const useStartTrainingSessionMutation = () => {
  const invalidateQueries = useInvalidateTrainingSessionQueries();

  return useMutation({
    mutationFn: startTrainingSession,
    onSuccess: invalidateQueries,
  });
};

// 훈련 세션 정상 종료 Mutation
export const useEndTrainingSessionMutation = () => {
  const invalidateQueries = useInvalidateTrainingSessionQueries();

  return useMutation({
    mutationFn: endTrainingSession,
    onSuccess: invalidateQueries,
  });
};

// 훈련 세션 강제 종료 Mutation
export const useForceEndTrainingSessionMutation = () => {
  const invalidateQueries = useInvalidateTrainingSessionQueries();

  return useMutation({
    mutationFn: forceEndTrainingSession,
    onSuccess: invalidateQueries,
  });
};
