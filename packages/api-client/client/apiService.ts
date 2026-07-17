import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestOptions {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  baseURL?: string;
  responseType?: AxiosRequestConfig['responseType'];
}

export interface ApiResult<T = any> {
  success: boolean;
  status: number;
  data?: T;
  error?: string;
}

function resolveBaseURL(): string {
  // Frontend (Vite)
  if (typeof window !== 'undefined') {
    try {
      const im: any = (0, eval)('import.meta');
      const viteEnv = im?.env;
      const url = viteEnv?.VITE_API_BASE_URL;
      if (url) return url;
    } catch {}
    return 'http://localhost:4000/api';
  }
  // Backend (Node)
  return process.env.API_BASE_URL || 'http://localhost:4000/api';
}

type Key = string;

export class ApiService {
  private client: AxiosInstance;
  private inflight: Map<Key, Promise<ApiResult<any>>> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: resolveBaseURL(),
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      // Attach Authorization if available (frontend)
      if (typeof window !== 'undefined') {
        try {
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            if (!config.headers) {
              config.headers = {} as any;
            }
            (config.headers as any)['Authorization'] = `Bearer ${accessToken}`;
          }
        } catch {}
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status || 0;
        const url = error.config?.url || '';
        // Log a concise error message; callers will receive a standardized error
        // Avoid importing frontend-specific logger to keep this shared module lightweight
        // eslint-disable-next-line no-console
        console.warn('[ApiService] Request failed', { status, url, message: error.message });
        return Promise.reject(error);
      },
    );
  }

  async request<T = any>(options: ApiRequestOptions): Promise<ApiResult<T>> {
    const { method, url, data, params, headers, baseURL, responseType } = options;
    const config: AxiosRequestConfig = { method, url, data, params, headers, responseType };
    if (baseURL) config.baseURL = baseURL;

    try {
      // Simple GET deduplication to avoid duplicate concurrent requests
      if (method === 'GET') {
        const key = JSON.stringify({ method, url, params, headers: headers ?? {} });
        if (this.inflight.has(key)) {
          return (await this.inflight.get(key)) as ApiResult<T>;
        }
        const p = (async () => {
          try {
            const r = await this.client.request<T>(config);
            return { success: true, status: r.status, data: r.data as T } as ApiResult<T>;
          } catch (e) {
            const err = e as AxiosError;
            const status = err.response?.status || 0;
            const message = err.response?.data && typeof err.response.data === 'object'
              ? (err.response.data as any).error || (err.response.data as any).message || err.message
              : err.message;
            return { success: false, status, error: message } as ApiResult<T>;
          } finally {
            this.inflight.delete(key);
          }
        })();
        this.inflight.set(key, p);
        return (await p) as ApiResult<T>;
      }

      const resp = await this.client.request<T>(config);
      return {
        success: true,
        status: resp.status,
        data: resp.data as T,
      };
    } catch (e) {
      const err = e as AxiosError;
      const status = err.response?.status || 0;
      const message = err.response?.data && typeof err.response.data === 'object'
        ? (err.response.data as any).error || (err.response.data as any).message || err.message
        : err.message;
      return {
        success: false,
        status,
        error: message,
      };
    }
  }

  async graphql<T = any>(query: string, variables?: Record<string, any>, endpoint = '/graphql'): Promise<ApiResult<T>> {
    return this.request<T>({
      method: 'POST',
      url: endpoint,
      data: { query, variables },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async uploadForm<T = any>(url: string, form: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<ApiResult<T>> {
    try {
      const resp = await this.client.post<T>(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      });
      return { success: true, status: resp.status, data: resp.data as T };
    } catch (e) {
      const err = e as AxiosError;
      const status = err.response?.status || 0;
      const message = err.response?.data && typeof err.response.data === 'object'
        ? (err.response.data as any).error || (err.response.data as any).message || err.message
        : err.message;
      return { success: false, status, error: message };
    }
  }
}

export const apiService = new ApiService();
