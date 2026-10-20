export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
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
