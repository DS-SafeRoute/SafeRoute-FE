import { useMutation, useQueryClient } from '@tanstack/react-query';

import { trainingSessionQueryKeys } from './trainingSessionQueryKeys';
import {
  createTrainingSession,
  endTrainingSession,
  forceEndTrainingSession,
  startTrainingSession,
} from './trainingSessionsApi';

// 세션 상태 변경 후 상태별 목록 캐시 갱신
const useInvalidateTrainingSessionLists = () => {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: trainingSessionQueryKeys.lists(),
    });
};

// 훈련 세션 등록 Mutation
export const useCreateTrainingSessionMutation = () => {
  const invalidateLists = useInvalidateTrainingSessionLists();

  return useMutation({
    mutationFn: createTrainingSession,
    onSuccess: invalidateLists,
  });
};

// 훈련 세션 시작 Mutation
export const useStartTrainingSessionMutation = () => {
  const invalidateLists = useInvalidateTrainingSessionLists();

  return useMutation({
    mutationFn: startTrainingSession,
    onSuccess: invalidateLists,
  });
};

// 훈련 세션 정상 종료 Mutation
export const useEndTrainingSessionMutation = () => {
  const invalidateLists = useInvalidateTrainingSessionLists();

  return useMutation({
    mutationFn: endTrainingSession,
    onSuccess: invalidateLists,
  });
};

// 훈련 세션 강제 종료 Mutation
export const useForceEndTrainingSessionMutation = () => {
  const invalidateLists = useInvalidateTrainingSessionLists();

  return useMutation({
    mutationFn: forceEndTrainingSession,
    onSuccess: invalidateLists,
  });
};
