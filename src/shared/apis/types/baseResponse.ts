export interface BaseResponse<T> {
  status: number;
  code: string;
  message: string;
  data: T;
}
