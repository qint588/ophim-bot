// lib/global.d.ts
export interface IDataResponse<T> {
  items: T[];
  pagination?: IPagination;
}

export interface IErrorResponse {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
