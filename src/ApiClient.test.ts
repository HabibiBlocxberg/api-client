import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, ApiMethods } from './ApiClient';
import { ApiResponseDto } from './ApiResponseDto';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient = new ApiClient({
      baseUrl: 'https://api.example.com',
      timeout: 5000
    });
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const client = new ApiClient();
      expect(client.getBaseUrl()).toBe('');
    });

    it('should initialize with provided config', () => {
      const client = new ApiClient({
        baseUrl: 'https://test.com',
        timeout: 3000
      });
      expect(client.getBaseUrl()).toBe('https://test.com');
    });
  });

  describe('setBaseUrl', () => {
    it('should update base URL', () => {
      apiClient.setBaseUrl('https://new-api.com');
      expect(apiClient.getBaseUrl()).toBe('https://new-api.com');
    });
  });

  describe('setToken', () => {
    it('should set authorization header when token is provided', () => {
      apiClient.setToken('test-token');
      expect(apiClient.getToken()).toBe('test-token');
    });

    it('should remove authorization header when token is empty', () => {
      apiClient.setToken('test-token');
      apiClient.setToken('');
      expect(apiClient.getToken()).toBe('');
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test' }),
        headers: new Map([['content-type', 'application/json']])
      });
    });

    it('should make GET request and return ApiResponseDto', async () => {
      const result = await apiClient.get<{ data: string }>('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.isSuccess()).toBe(true);
      expect(result.getData()).toEqual({ data: 'test' });
    });

    it('should make POST request with data', async () => {
      const data = { name: 'test' };
      const result = await apiClient.post('/test', data);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      );
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.isSuccess()).toBe(true);
    });

    it('should make PUT request', async () => {
      const data = { id: 1, name: 'updated' };
      const result = await apiClient.put('/test/1', data);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data)
        })
      );
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.isSuccess()).toBe(true);
    });

    it('should make PATCH request', async () => {
      const data = { name: 'patched' };
      const result = await apiClient.patch('/test/1', data);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data)
        })
      );
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.isSuccess()).toBe(true);
    });

    it('should make DELETE request', async () => {
      const result = await apiClient.delete('/test/1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.isSuccess()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should return error ApiResponseDto on HTTP error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockResolvedValue({ message: 'Resource not found' })
      });

      const result = await apiClient.get('/not-found');
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.isError()).toBe(true);
      expect(result.getError()).toBe('Resource not found');
    });

    it('should handle network errors with error ApiResponseDto', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await apiClient.get('/test');
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.isError()).toBe(true);
      expect(result.getError()).toBe('Network error');
    });
  });

  describe('ApiMethods enum', () => {
    it('should have correct HTTP methods', () => {
      expect(ApiMethods.GET).toBe('GET');
      expect(ApiMethods.POST).toBe('POST');
      expect(ApiMethods.PUT).toBe('PUT');
      expect(ApiMethods.PATCH).toBe('PATCH');
      expect(ApiMethods.DELETE).toBe('DELETE');
    });
  });
}); 