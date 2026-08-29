import { isAxiosError, isCancel } from 'axios';

import axiosInstance from '@apis/config/axiosInstance';
import { RESPONSE_MESSAGE } from '@apis/constants/response';
import { ApiError } from '@apis/errors/apiError';
import type { BaseResponse } from '@apis/types/baseResponse';

import type { Method } from 'axios';

export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const satisfies Record<string, Method>;

export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];
type QueryPrimitive = string | number | boolean;
type QueryValue = QueryPrimitive | QueryPrimitive[] | null | undefined;

export interface RequestConfig<TBody = unknown> {
  method: HttpMethod;
  url: string;
  query?: Record<string, QueryValue>;
  body?: TBody;
  signal?: AbortSignal;
  responseMode?: 'wrapped' | 'raw';
}

export const request = async <TResponse, TBody = unknown>(
  config: RequestConfig<TBody>,
): Promise<TResponse> => {
  const { method, url, query, body, signal, responseMode = 'wrapped' } = config;

  try {
    const response = await axiosInstance.request<BaseResponse<TResponse> | TResponse>({
      method,
      url,
      params: query,
      data: body,
      signal,
    });

    if (responseMode === 'raw') {
      return response.data as TResponse;
    }

    const wrappedResponse = response.data as BaseResponse<TResponse>;

    if (!wrappedResponse.isSuccess) {
      throw new ApiError(wrappedResponse.code, wrappedResponse.message);
    }

    return wrappedResponse.result;
  } catch (error: unknown) {
    if (isCancel(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (import.meta.env.DEV) {
        console.error(`[실패] ${url} : ${error.message}`);
      }
      throw error;
    }

    if (!isAxiosError<BaseResponse<unknown>>(error)) {
      // 클라이언트 내부 런타임 에러
      if (import.meta.env.DEV) {
        console.error(`[실패] ${url} : 알 수 없는 오류`, error);
      }
      throw error;
    }

    const { response } = error;

    if (response) {
      const { status } = response;
      const message = response.data?.message;

      const displayMessage =
        RESPONSE_MESSAGE[status as keyof typeof RESPONSE_MESSAGE] ??
        message ??
        '알 수 없는 오류가 발생했습니다.';

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
