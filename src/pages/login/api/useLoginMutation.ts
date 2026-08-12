import { useMutation } from '@tanstack/react-query';

import { login } from './loginApi';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,
  });
};
