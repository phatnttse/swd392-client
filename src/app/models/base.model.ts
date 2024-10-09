export interface BaseResponse<T> {
  message: string;
  code: number;
  success: boolean;
  data: T;
}
