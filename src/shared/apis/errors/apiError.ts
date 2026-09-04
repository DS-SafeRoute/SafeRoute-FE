import { isAxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 서버 에러 코드·메시지를 한 곳에서 꺼내는 공용 헬퍼 — 200 + isSuccess:false는 ApiError로,
// HTTP 4xx/5xx(바디가 BaseResponse 형태라도)는 AxiosError로 서로 다르게 올라오므로 둘 다 봐야 함.
// floorPlans/트레이닝분석 등 여러 화면에서 같은 패턴이 반복돼 있어서 공용화함
// (참고: request.ts는 요청 자체를 ApiError로 바꿔주지 않고 원본 AxiosError를 그대로 던짐 —
// 200+isSuccess:false일 때만 request.ts가 ApiError로 감싸줌)
export const extractApiError = (error: unknown): { code: string; message: string } => {
  if (error instanceof ApiError) {
    return { code: error.code, message: error.message };
  }
  const responseData = isAxiosError(error) ? error.response?.data : undefined;
  const body =
    responseData && typeof responseData === 'object'
      ? (responseData as { code?: unknown; message?: unknown })
      : undefined;
  return {
    code: String(body?.code ?? ''),
    message: String(body?.message ?? ''),
  };
};
