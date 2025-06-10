import { ApiResponseDto } from './ApiResponseDto';
import { ApiClientConfig, RequestConfig } from './types';

export enum ApiMethods {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE",
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;
  private authToken?: string;

  constructor (config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || "";
    this.defaultTimeout = config.timeout || 10000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...config.defaultHeaders,
    };
  }

  public setBaseUrl (url: string): void {
    this.baseUrl = url;
  }

  public getBaseUrl (): string {
    return this.baseUrl;
  }

  public setToken (token: string): void {
    this.authToken = token;
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  public getToken (): string | undefined {
    return this.authToken;
  }

  public async get<T> (
    url: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponseDto<T>> {
    return this.request<T>(url, ApiMethods.GET, undefined, config);
  }

  public async post<T> (
    url: string, 
    data?: unknown, 
    config: RequestConfig = {}
  ): Promise<ApiResponseDto<T>> {
    return this.request<T>(url, ApiMethods.POST, data, config);
  }

  public async put<T> (
    url: string, 
    data?: unknown, 
    config: RequestConfig = {}
  ): Promise<ApiResponseDto<T>> {
    return this.request<T>(url, ApiMethods.PUT, data, config);
  }

  public async patch<T> (
    url: string, 
    data?: unknown, 
    config: RequestConfig = {}
  ): Promise<ApiResponseDto<T>> {
    return this.request<T>(url, ApiMethods.PATCH, data, config);
  }

  public async delete<T> (
    url: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponseDto<T>> {
    return this.request<T>(url, ApiMethods.DELETE, undefined, config);
  }

  private async request<T> (
    url: string,
    method: ApiMethods,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<ApiResponseDto<T>> {

    const fullUrl = this.buildUrl(url, config.baseUrl);
    const headers = this.buildHeaders(config.headers);
    const timeout = config.timeout || this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestInit: RequestInit = {
        method,
        headers,
        signal: config.signal || controller.signal,
      };

      if (data && method !== ApiMethods.GET) {
        requestInit.body = JSON.stringify(data);
      }

      if (config.withCredentials) {
        requestInit.credentials = 'include';
      }
      if (this.getToken()) {
  
        headers.set('Authorization', `Bearer ${this.getToken()}`);
      }

      const response = await fetch(fullUrl, requestInit);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        return ApiResponseDto.error<T>(error.message);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const rawResponseData = await response.json();
        
        // Check if response has Backend API structure { success: true, data: ... }
        if (rawResponseData && typeof rawResponseData === 'object' && 'success' in rawResponseData) {
          // If Backend returned an error
          if (!rawResponseData.success) {
            const errorMessage = rawResponseData.error?.message || rawResponseData.error || 'Unknown error from backend';
            return ApiResponseDto.error<T>(errorMessage);
          }
          
          // If Backend was successful, extract the data part
          const responseData = rawResponseData.data as T;
          return ApiResponseDto.success<T>(responseData);
        }
        
        // Fallback for responses without Backend API structure
        const responseData = rawResponseData as T;
        return ApiResponseDto.success<T>(responseData);
      } else {
        const responseData = await response.text() as unknown as T;
        return ApiResponseDto.success<T>(responseData);
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return ApiResponseDto.error<T>('Request timeout');
      }
      
      if (error instanceof ApiError) {
        return ApiResponseDto.error<T>(error.message);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ApiResponseDto.error<T>(errorMessage);
    }
  }

  private buildUrl (endpoint: string, baseUrl?: string): string {
    const url = baseUrl || this.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    return `${url}${cleanEndpoint}`;
  }

  private buildHeaders (customHeaders?: Record<string, string>): Headers {
    const headers = new Headers();
    
    Object.entries(this.defaultHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    if (customHeaders) {
      Object.entries(customHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    return headers;
  }

  private async handleErrorResponse (response: Response): Promise<ApiError> {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    let code = response.status.toString();

    try {
      const errorData = await response.json() as { message?: string; error?: string; code?: string };
      message = errorData.message || errorData.error || message;
      code = errorData.code || code;
    } catch {
      const textError = await response.text();
      if (textError) {
        message = textError;
      }
    }

    return new ApiError(message, response.status, code);
  }
}

export class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor (message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
} 