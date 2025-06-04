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

  public async get<T> (
    url: string, 
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(url, ApiMethods.GET, undefined, config);
  }

  public async post<T> (
    url: string, 
    data?: unknown, 
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(url, ApiMethods.POST, data, config);
  }

  public async put<T> (
    url: string, 
    data?: unknown, 
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(url, ApiMethods.PUT, data, config);
  }

  public async patch<T> (
    url: string, 
    data?: unknown, 
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(url, ApiMethods.PATCH, data, config);
  }

  public async delete<T> (
    url: string, 
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(url, ApiMethods.DELETE, undefined, config);
  }

  private async request<T> (
    url: string,
    method: ApiMethods,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    const fullUrl = this.buildUrl(url, config.baseUrl);
    const headers = this.buildHeaders(config.headers);
    const timeout = config.timeout || this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestInit: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (data && method !== ApiMethods.GET) {
        requestInit.body = JSON.stringify(data);
      }

      if (config.withCredentials) {
        requestInit.credentials = 'include';
      }

      const response = await fetch(fullUrl, requestInit);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json() as Promise<T>;
      }

      return response.text() as unknown as Promise<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      throw error;
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