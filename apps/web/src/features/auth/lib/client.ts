// src/features/auth/lib/client.ts

import { UserRole as UserRoleType } from '@/types/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  createdAt: string;
  accountType: string;
}

export class ClientAuth {
  private static readonly ACCESS_TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user';
  private static readonly REMEMBER_ME_KEY = 'remember_me';

  static setTokens(tokens: { accessToken: string; refreshToken?: string }): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      const storage = this.getRememberMe() ? localStorage : sessionStorage;
      storage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    let token = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!token && this.getRememberMe()) {
      token = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return token;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      console.error('Failed to parse user data');
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  static clearAuth(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
  }

  static setRememberMe(value: boolean): void {
    if (value) {
      localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(this.REMEMBER_ME_KEY);
    }
  }

  static getRememberMe(): boolean {
    return localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
  }

  static getAuthHeader(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static validateToken(token: string): boolean {
    if (!token) return false;
    try {
      const payload = this.parseJwt(token);
      if (!payload) return false;
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('Token expired');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Invalid token format:', error);
      return false;
    }
  }

  static parseJwt(token: string): Record<string, any> | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const jsonPayload = atob(paddedBase64);
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      return null;
    }
  }

  static getTokenExpiration(token: string): Date | null {
    const payload = this.parseJwt(token);
    if (!payload || !payload.exp) return null;
    return new Date(payload.exp * 1000);
  }

  static isTokenExpiringSoon(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return false;
    return expiration.getTime() < Date.now() + 5 * 60 * 1000;
  }

  static init(): void {
    const token = this.getAccessToken();
    if (token && !this.validateToken(token)) {
      console.warn('Invalid or expired token on init — clearing auth');
      this.clearAuth();
    }
  }
}