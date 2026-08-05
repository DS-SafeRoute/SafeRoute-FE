import { isAxiosError } from 'axios';

import { RESPONSE_MESSAGE } from '@apis/constants/response';
import type { BaseResponse } from '@apis/types/baseResponse';

import axiosInstance from './axiosInstance';

export const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

export type HTTPMethodType = (typeof HTTPMethod)[keyof typeof HTTPMethod];
type QueryValue = string | number | boolean | Array<string | number | boolean>;
export interface RequestConfig {
  method: HTTPMethodType;
  url: string;
  query?: Record<string, QueryValue>;
  body?: Record<string, unknown>;
}

export const request = async <T>(config: RequestConfig): Promise<T> => {
  const { method, url, query, body } = config;

  try {
    const response = await axiosInstance.request<BaseResponse<T>>({
      method,
      url,
      params: query,
      data: body,
    });

    if (import.meta.env.DEV) {
      console.log(`[성공] ${url} : ${response.data.message}`);
    }

    return response.data.data;
  } catch (error: unknown) {
    if (!isAxiosError(error)) {
      // 클라이언트 내부 런타임 에러
      console.error(`[실패] ${url} : 알 수 없는 오류`, error);
      throw error;
    }

    const { response } = error;

    if (response) {
      const { status } = response;
      const errorData = response.data as BaseResponse<unknown>;
      const message = errorData?.message;

      const displayMessage =
        RESPONSE_MESSAGE[status] || message || '알 수 없는 오류가 발생했습니다.';

      if (import.meta.env.DEV) {
        console.error(`[실패] ${url} : ${displayMessage}`);
      }
    } else {
      // 서버 응답 자체를 못 받은 경우
      if (import.meta.env.DEV) {
        console.error(`[실패] ${url} : 서버에 연결할 수 없습니다.`);
      }
    }
    throw error;
  }
};
