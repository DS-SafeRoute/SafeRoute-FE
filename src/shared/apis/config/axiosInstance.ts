import axios from 'axios';

import { API_ENDPOINTS } from '@apis/constants/endpoints';

import { ROUTES } from '@constants/path';

import { clearAccessToken, getAccessToken } from '@shared/auth/tokenStorage';

import type { AxiosError } from 'axios';

const REQUEST_TIMEOUT_MS: number = 30_000; // 30초

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
});

const PUBLIC_AUTH_ENDPOINTS: readonly string[] = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.SIGNUP,
];

const isPublicAuthEndpoint = (url?: string) => {
  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => endpoint === url);
};

axiosInstance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken && !isPublicAuthEndpoint(config.url)) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const currentAccessToken = getAccessToken();
    const requestAuthorization = error.config?.headers.get('Authorization');
    const isCurrentSessionRequest =
      currentAccessToken !== null && requestAuthorization === `Bearer ${currentAccessToken}`;

    if (
      error.response?.status === 401 &&
      !isPublicAuthEndpoint(error.config?.url) &&
      isCurrentSessionRequest
    ) {
      clearAccessToken();

      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.replace(ROUTES.LOGIN);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
