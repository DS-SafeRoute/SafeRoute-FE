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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

// 로컬 실행을 제외한 운영 환경에서 인증 토큰이 HTTP로 전송되지 않도록 차단
const validateSecureApiUrl = () => {
  if (!import.meta.env.PROD || LOCAL_HOSTNAMES.has(window.location.hostname)) {
    return;
  }

  const apiUrl = new URL(API_BASE_URL || window.location.origin, window.location.origin);

  if (window.location.protocol !== 'https:' || apiUrl.protocol !== 'https:') {
    throw new Error('운영 환경에서는 HTTPS API만 사용할 수 있습니다.');
  }
};

validateSecureApiUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
  _sessionRefreshToken?: string;
};

interface ReissueTask {
  refreshToken: string;
  promise: Promise<string>;
}

let reissueTask: ReissueTask | null = null;

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
const reissueAccessToken = async (refreshToken: string) => {
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

  if (getRefreshToken() !== refreshToken) {
    throw new Error('토큰 재발급 중 인증 세션이 변경되었습니다.');
  }

  setTokens(accessToken, rotatedRefreshToken, isPersistent);
  return accessToken;
};

const getReissuedAccessToken = (refreshToken: string) => {
  if (reissueTask?.refreshToken === refreshToken) {
    return reissueTask.promise;
  }

  const promise = reissueAccessToken(refreshToken).finally(() => {
    if (reissueTask?.promise === promise) {
      reissueTask = null;
    }
  });

  reissueTask = { refreshToken, promise };
  return promise;
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

    const requestAuthorization = requestConfig.headers.get('Authorization');

    if (requestConfig._retry) {
      if (requestConfig._sessionRefreshToken === getRefreshToken()) {
        clearSession();
      }

      return Promise.reject(error);
    }

    const currentAccessToken = getAccessToken();
    const currentRefreshToken = getRefreshToken();

    if (!currentAccessToken || !currentRefreshToken || !requestAuthorization) {
      if (!currentAccessToken) {
        clearSession();
      }

      return Promise.reject(error);
    }

    requestConfig._retry = true;
    requestConfig._sessionRefreshToken = currentRefreshToken;

    try {
      // 대기 중 다른 요청이 이미 토큰을 갱신했다면 추가 재발급 없이 최신 토큰 사용
      const accessToken =
        requestAuthorization === `Bearer ${currentAccessToken}`
          ? await getReissuedAccessToken(currentRefreshToken)
          : currentAccessToken;

      requestConfig.headers.set('Authorization', `Bearer ${accessToken}`);
      return axiosInstance(requestConfig);
    } catch (reissueError: unknown) {
      if (getRefreshToken() === currentRefreshToken) {
        clearSession();
      }

      return Promise.reject(reissueError);
    }
  },
);

export default axiosInstance;
