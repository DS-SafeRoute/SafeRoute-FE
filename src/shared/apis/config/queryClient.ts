import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

const MAX_QUERY_RETRY_COUNT = 1;

const canRetryQuery = (failureCount: number, error: Error) => {
  if (failureCount >= MAX_QUERY_RETRY_COUNT || !isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;

  return status === undefined || status === 408 || status === 429 || status >= 500;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 브라우저 포커싱 시 자동 재요청 방지
      retry: canRetryQuery,
      staleTime: 1000 * 60 * 5, // 5분
    },
  },
});
