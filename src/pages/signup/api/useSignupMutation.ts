import { useMutation } from '@tanstack/react-query';

import { postSignup } from './signupApi';

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: postSignup,
  });
};
