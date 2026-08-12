import { useMutation } from '@tanstack/react-query';

import { signup } from './signupApi';

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: signup,
  });
};
