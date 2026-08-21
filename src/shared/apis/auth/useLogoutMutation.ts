import { useMutation } from '@tanstack/react-query';

import { postLogout } from './logoutApi';

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: postLogout,
  });
};
