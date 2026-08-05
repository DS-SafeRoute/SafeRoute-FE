import axios from 'axios';

import type { AxiosError } from 'axios';

const Instance_timeout: number = 30_000; // 30초

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Instance_timeout,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
