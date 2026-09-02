import axios from 'axios';

import type { ReissueResponse } from '@apis/__generated__/data-contracts';
import { queryClient } from '@apis/config/queryClient';
import { API_ENDPOINTS } from '@apis/constants/endpoints';
import type { BaseResponse } from '@apis/types/baseResponse';

import { ROUTES } from '@constants/path';

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isTokenPersistent,
  setTokens,
} from '@shared/auth/tokenStorage';

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const REQUEST_TIMEOUT_MS: number = 30_000; // 30초

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
});

const PUBLIC_AUTH_ENDPOINTS: readonly string[] = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REISSUE,
  API_ENDPOINTS.AUTH.SIGNUP,
];

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let reissuePromise: Promise<string> | null = null;

// 공개 인증 API 확인 (로그인, 토큰 재발급, 회원가입)
const isPublicAuthEndpoint = (url?: string) => {
  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => endpoint === url);
};

// 인증 정보를 초기화, 로그인 페이지로 리다이렉트
const clearSession = () => {
  clearTokens();
  queryClient.clear();

  if (window.location.pathname !== ROUTES.LOGIN) {
    window.location.replace(ROUTES.LOGIN);
  }
};

// token을 재발급하고 기존 저장 방식으로 갱신
const reissueAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('refresh token이 없습니다.');
  }

  const isPersistent = isTokenPersistent();
  const { data } = await axiosInstance.post<BaseResponse<ReissueResponse>>(
    API_ENDPOINTS.AUTH.REISSUE,
    { refreshToken },
  );

  if (!data.isSuccess) {
    throw new Error(data.message);
  }

  const { accessToken, refreshToken: rotatedRefreshToken } = data.result;

  if (!accessToken || !rotatedRefreshToken) {
    throw new Error('토큰 재발급 응답에 인증 토큰이 없습니다.');
  }

  setTokens(accessToken, rotatedRefreshToken, isPersistent);
  return accessToken;
};

const getReissuedAccessToken = () => {
  if (!reissuePromise) {
    reissuePromise = reissueAccessToken().finally(() => {
      reissuePromise = null;
    });
  }

  return reissuePromise;
};

// access token 추가
axiosInstance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken && !isPublicAuthEndpoint(config.url)) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
});

// 401 응답이면 토큰을 재발급 및 재시도
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const requestConfig = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !requestConfig ||
      isPublicAuthEndpoint(requestConfig.url)
    ) {
      return Promise.reject(error);
    }

    if (requestConfig._retry) {
      clearSession();
      return Promise.reject(error);
    }

    const currentAccessToken = getAccessToken();
    const requestAuthorization = requestConfig.headers.get('Authorization');

    if (!currentAccessToken || !requestAuthorization) {
      clearSession();
      return Promise.reject(error);
    }

    requestConfig._retry = true;

    try {
      // 대기 중 다른 요청이 이미 토큰을 갱신했다면 추가 재발급 없이 최신 토큰 사용
      const accessToken =
        requestAuthorization === `Bearer ${currentAccessToken}`
          ? await getReissuedAccessToken()
          : currentAccessToken;

      requestConfig.headers.set('Authorization', `Bearer ${accessToken}`);
      return axiosInstance(requestConfig);
    } catch (reissueError: unknown) {
      clearSession();
      return Promise.reject(reissueError);
    }
  },
);

export default axiosInstance;
