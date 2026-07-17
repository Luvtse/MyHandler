// src/lib/api/client.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/lib/api/endpoints';
import { ClientAuth } from '@/features/auth/lib/client'; // ← updated import
import { toast } from 'sonner';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: any;
  message?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = ClientAuth.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = ClientAuth.getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token');

            const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, { refreshToken });
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            ClientAuth.setTokens({ accessToken, refreshToken: newRefreshToken });
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            ClientAuth.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        const message = (error.response?.data as any)?.message || error.message || 'An error occurred';
        toast.error(message);
        return Promise.reject(error);
      }
    );
  }

  public async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance(config);
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        error: error,
        message: error.message || 'Request failed',
        statusCode: error.response?.status,
      };
    }
  }

  public async graphql<T = any>(query: string, variables?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url: '/graphql',
      data: { query, variables },
    });
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  public async uploadForm<T = any>(url: string, formData: FormData, onProgress?: (e: any) => void): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  }
}

export const apiService = new ApiService();

export const apiRequestData = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await apiService.request<T>(config);
  if (!response.success) throw response.error;
  return response.data;
};