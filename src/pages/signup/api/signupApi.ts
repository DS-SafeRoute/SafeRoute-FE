import type { SignupRequest, SignupResponse } from '@apis/__generated__/data-contracts';
import { request, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export const signup = (body: SignupRequest) => {
  return request<SignupResponse, SignupRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.AUTH.SIGNUP,
    body,
  });
};
