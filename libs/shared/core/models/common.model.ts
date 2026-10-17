export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ErrorResponse {
  status: number;
  message: string;
  path?: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}
