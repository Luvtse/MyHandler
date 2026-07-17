// src/features/auth/lib/service.ts

import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { apiService } from '@/lib/api/client';
import { ClientAuth } from '@/features/auth/lib/client';
import { User } from '@/types/auth';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: string;
  accountType?: 'personal' | 'business';
  businessInfo?: {
    companyName: string;
    taxId?: string;
    businessType?: string;
    industry?: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const AuthService = {
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const { success, data, error } = await apiService.request<AuthResponse>({ method: 'POST', url: API_ENDPOINTS.auth.login, data: credentials });
    if (!success || !data) throw error || 'Login failed';
    const { accessToken, refreshToken } = data;
    ClientAuth.setTokens({ accessToken, refreshToken });
    return data;
  },

  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const { success, data: resp, error } = await apiService.request<AuthResponse>({ method: 'POST', url: API_ENDPOINTS.auth.register, data });
    if (!success || !resp) throw error || 'Register failed';
    const { accessToken, refreshToken } = resp;
    ClientAuth.setTokens({ accessToken, refreshToken });
    return resp;
  },

  getProfile: async (): Promise<User> => {
    const { success, data, error } = await apiService.request<User>({ method: 'GET', url: API_ENDPOINTS.users.profile });
    if (!success || !data) throw error || 'Profile fetch failed';
    return data as unknown as User;
  },

  inviteInternal: async (payload: { email: string; name: string; role: string; phone?: string }) => {
    const { success, data, error } = await apiService.request<{ success: boolean; inviteLink: string; userId: string }>({
      method: 'POST',
      url: '/auth/admin/invite',
      data: payload,
    });
    if (!success || !data) throw error || 'Invite failed';
    return data;
  },

  logout: async () => {
    try {
      await apiService.request({ method: 'POST', url: API_ENDPOINTS.auth.logout });
    } catch (error) {
      console.warn('Logout API call failed, proceeding with client-side cleanup');
    } finally {
      ClientAuth.clearAuth();
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    const { success, error } = await apiService.request({
      method: 'POST',
      url: API_ENDPOINTS.auth.forgot,
      data: { email },
    });
    if (!success) throw error || 'Failed to send password reset email';
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    const { success, error } = await apiService.request({
      method: 'POST',
      url: API_ENDPOINTS.auth.reset,
      data: { token, password },
    });
    if (!success) throw error || 'Failed to reset password';
  },
};