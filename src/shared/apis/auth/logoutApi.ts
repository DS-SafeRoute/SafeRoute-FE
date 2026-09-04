import type { LogoutData } from '@apis/__generated__/data-contracts';
import { request, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export const postLogout = () => {
  return request<LogoutData['result']>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.AUTH.LOGOUT,
  });
};
