import { useMutation } from '@tanstack/react-query';

import { postLogin } from './loginApi';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: postLogin,
  });
};
