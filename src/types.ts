export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  baseUrl?: string;
}

export interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
} 