export interface PageResponse<T> {
  message: string;
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface PageParams {
  page?: number;
  size?: number;
}
