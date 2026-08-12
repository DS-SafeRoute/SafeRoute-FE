import axios from 'axios';

import { clearAccessToken, getAccessToken } from '@apis/auth/accessToken';

import { ROUTES } from '@constants/path';

import type { AxiosError } from 'axios';

const REQUEST_TIMEOUT_MS: number = 30_000; // 30초

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const accessToken = getAccessToken();

    if (error.response?.status === 401 && accessToken) {
      clearAccessToken();

      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.replace(ROUTES.LOGIN);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
