import type { LoginRequest, LoginResponse } from '@apis/__generated__/data-contracts';
import { request, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface LoginResult extends LoginResponse {
  accessToken: string;
}

export const login = async (body: LoginRequest): Promise<LoginResult> => {
  const response = await request<LoginResponse, LoginRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.AUTH.LOGIN,
    body,
  });

  if (!response.accessToken) {
    throw new Error('로그인 응답에 access token이 없습니다.');
  }

  return { ...response, accessToken: response.accessToken };
};
